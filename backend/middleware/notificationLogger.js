import notificationService from '../services/notificationService.js';
import { EVENT_TYPES } from '../config/notificationEvents.js';
import User from '../models/User.js';

export const logAffiliatePageAccess = async (req, res, next) => {
  // Log para debug
  console.log(`🔍 [DEBUG] Request received: ${req.method} ${req.originalUrl}`);
  console.log(`🔍 [DEBUG] User-Agent: ${req.get('User-Agent')}`);
  console.log(`🔍 [DEBUG] IP: ${req.ip}`);
  
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 200 && req.originalUrl.includes('/afiliate')) {
      console.log(`🎯 [DEBUG] Affiliate route detected! Status: ${res.statusCode}`);
      console.log(`📊 [DEBUG] Response data preview:`, data.toString().substring(0, 100));
      
      try {
        const response = JSON.parse(data);
        
        if (response.message === 'success' && response.data) {
          const { balance, associatedUsers } = response.data;
          const afiliateId = req.params.afiliateId;
          
          console.log(`🆔 [DEBUG] Affiliate ID: ${afiliateId}`);
          console.log(`💰 [DEBUG] Balance: ${balance}`);
          
          if (afiliateId) {
            User.findById(afiliateId).select('name email').lean()
              .then(user => {
                if (user) {
                  console.log(`👤 [DEBUG] User found: ${user.name} (${user.email})`);
                  
                  notificationService.sendMessage(EVENT_TYPES.AFFILIATE_PAGE_ACCESS, {
                    userId: afiliateId,
                    userName: user.name,
                    userEmail: user.email,
                    balance,
                    associatedUsers
                  });
                } else {
                  console.log(`❌ [DEBUG] User not found for ID: ${afiliateId}`);
                }
              })
              .catch(error => {
                console.error('❌ [DEBUG] Error fetching user data:', error);
              });
          }
        } else {
          console.log(`⚠️ [DEBUG] Response format not matching expected structure`);
        }
      } catch (parseError) {
        console.error('❌ [DEBUG] Error parsing response:', parseError);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};