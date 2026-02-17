'use client';

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUsersOverview, checkIsAdmin, validateAdmin } from "../services/admin-service";
import Input from "../components/input";
import { Loader2, Lock, User, Users, DollarSign, CheckCircle, Clock, TrendingUp, Search, ArrowUpDown, ArrowUp, ArrowDown, Receipt, Copy, Check } from "lucide-react";
import Link from "next/link";
import Logo from "../components/logo";

interface UserOverview {
    _id: string;
    name: string;
    email: string;
    phone: number;
    balance: number;
    totalInvoiced: number;
    paidTransactions: number;
    pendingTransactions: number;
    associatedUsers: number;
}

type SortField = 'name' | 'balance' | 'totalInvoiced' | 'paidTransactions' | 'pendingTransactions' | 'associatedUsers';
type SortOrder = 'asc' | 'desc';

function AdminSkeleton() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4">
            <div className="animate-pulse">
                <div className="h-8 bg-neutral-800 rounded w-32 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                            <div className="h-4 bg-neutral-700 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-neutral-700 rounded w-20"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <div className="h-6 bg-neutral-700 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-neutral-700/50 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userIdFromUrl = searchParams.get('ref');

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(true);
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isValidatingPassword, setIsValidatingPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [users, setUsers] = useState<UserOverview[]>([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isAdminCheckComplete, setIsAdminCheckComplete] = useState<boolean>(false);
    const [isValidAdmin, setIsValidAdmin] = useState<boolean>(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            if (!userIdFromUrl) {
                router.push('/');
                return;
            }

            setUserId(userIdFromUrl);

            try {
                const response = await checkIsAdmin(userIdFromUrl);
                
                if (response.isAdmin) {
                    setIsValidAdmin(true);
                    setUserName(response.userName || '');
                } else {
                    setError('Acesso negado. Você não tem permissão para acessar esta página.');
                }
            } catch (err) {
                setError('Erro ao verificar permissões. Tente novamente.');
            } finally {
                setIsAdminCheckComplete(true);
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, [userIdFromUrl, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

    const handleLogin = async () => {
        if (!userId || !password) {
            setError('Preencha a senha');
            return;
        }

        setIsValidatingPassword(true);
        setError('');

        try {
            const response = await validateAdmin(userId, password);
            if (response.success) {
                setIsAuthenticated(true);
                setShowModal(false);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Senha incorreta');
        } finally {
            setIsValidatingPassword(false);
        }
    };

    const fetchUsers = async () => {
        setIsFetchingUsers(true);
        try {
            const data = await getUsersOverview();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setIsFetchingUsers(false);
        }
    };

    const formatCurrency = (value: number) => {
        return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatPhone = (phone: number) => {
        const phoneStr = phone.toString();
        if (phoneStr.length === 11) {
            return `(${phoneStr.slice(0, 2)}) ${phoneStr.slice(2, 7)}-${phoneStr.slice(7)}`;
        }
        return phoneStr;
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 ml-1 inline" />;
        }
        return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
    };

    const copyToClipboard = async (text: string, fieldId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldId);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.phone.toString().includes(term)
            );
        }

        result.sort((a, b) => {
            let aVal: string | number = a[sortField];
            let bVal: string | number = b[sortField];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = (bVal as string).toLowerCase();
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, searchTerm, sortField, sortOrder]);

    const totalBalance = useMemo(() => users.reduce((acc, u) => acc + u.balance, 0), [users]);
    const totalInvoiced = useMemo(() => users.reduce((acc, u) => acc + u.totalInvoiced, 0), [users]);
    const totalPaidTransactions = useMemo(() => users.reduce((acc, u) => acc + u.paidTransactions, 0), [users]);
    const totalAssociatedUsers = useMemo(() => users.reduce((acc, u) => acc + u.associatedUsers, 0), [users]);

    if (isLoading || !isAdminCheckComplete) {
        return <AdminSkeleton />;
    }

    if (!isValidAdmin) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Link href="/" className="text-red-500 hover:underline">
                        Voltar para página inicial
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-800 border border-neutral-700 p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-neutral-700 rounded-full">
                                <Lock className="w-8 h-8 text-amber-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2">Acesso Admin</h2>
                        <p className="text-neutral-400 text-center mb-6">
                            Olá, <span className="text-white font-medium">{userName}</span>. Digite sua senha para continuar.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Senha</label>
                                <Input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={isValidatingPassword}
                                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isValidatingPassword ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Validando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-between items-center font-semibold p-2 py-4 lg:px-54">
                <Logo />
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="px-4 py-2 bg-black/50 hover:bg-black/70 rounded-md text-lg text-slate-200"
                    >
                        Voltar
                    </Link>
                </div>
            </div>

            <div className="pt-20 max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">Total Usuários</p>
                                <p className="text-2xl font-bold">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">Saldo Total</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Receipt className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">Total Faturado</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">Transações Pagas</p>
                                <p className="text-2xl font-bold">{totalPaidTransactions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">Usuários Trazidos</p>
                                <p className="text-2xl font-bold">{totalAssociatedUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-neutral-700 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 className="text-lg font-semibold">Lista de Usuários</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome, email ou telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 w-full md:w-80"
                            />
                        </div>
                    </div>

                    {isFetchingUsers ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-700/50">
                                    <tr>
                                        <th
                                            className="text-left p-4 text-sm font-semibold text-neutral-300 cursor-pointer hover:text-white"
                                            onClick={() => handleSort('name')}
                                        >
                                            Nome {getSortIcon('name')}
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-300">Contato</th>
                                        <th
                                            className="text-right p-4 text-sm font-semibold text-neutral-300 cursor-pointer hover:text-white"
                                            onClick={() => handleSort('balance')}
                                        >
                                            Saldo {getSortIcon('balance')}
                                        </th>
                                        <th
                                            className="text-right p-4 text-sm font-semibold text-neutral-300 cursor-pointer hover:text-white"
                                            onClick={() => handleSort('totalInvoiced')}
                                        >
                                            Total Faturado {getSortIcon('totalInvoiced')}
                                        </th>
                                        <th
                                            className="text-center p-4 text-sm font-semibold text-neutral-300 cursor-pointer hover:text-white"
                                            onClick={() => handleSort('paidTransactions')}
                                        >
                                            Trans. Pagas {getSortIcon('paidTransactions')}
                                        </th>
                                        <th
                                            className="text-center p-4 text-sm font-semibold text-neutral-300 cursor-pointer hover:text-white"
                                            onClick={() => handleSort('pendingTransactions')}
                                        >
                                            Trans. Pendentes {getSortIcon('pendingTransactions')}
                                        </th>
                                        <th
                                            className="text-center p-4 text-sm font-semibold text-neutral-300 cursor-pointer hover:text-white"
                                            onClick={() => handleSort('associatedUsers')}
                                        >
                                            Usuários Trazidos {getSortIcon('associatedUsers')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-700">
                                    {filteredAndSortedUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-neutral-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                                                        <span className="text-lg font-medium text-neutral-300">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-xs text-neutral-500">{user._id}</p>
                                                            <button
                                                                onClick={() => copyToClipboard(user._id, `id-${user._id}`)}
                                                                className="p-1 hover:bg-neutral-600 rounded transition-colors"
                                                                title="Copiar ID"
                                                            >
                                                                {copiedField === `id-${user._id}` ? (
                                                                    <Check className="w-3 h-3 text-green-400" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3 text-neutral-500" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm">{user.email}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(user.email, `email-${user._id}`)}
                                                        className="p-1 hover:bg-neutral-600 rounded transition-colors"
                                                        title="Copiar email"
                                                    >
                                                        {copiedField === `email-${user._id}` ? (
                                                            <Check className="w-3 h-3 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-neutral-500" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <p className="text-sm text-neutral-400">{formatPhone(user.phone)}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(user.phone.toString(), `phone-${user._id}`)}
                                                        className="p-1 hover:bg-neutral-600 rounded transition-colors"
                                                        title="Copiar telefone"
                                                    >
                                                        {copiedField === `phone-${user._id}` ? (
                                                            <Check className="w-3 h-3 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-neutral-500" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`font-medium ${user.balance > 0 ? 'text-green-400' : 'text-neutral-400'}`}>
                                                    {formatCurrency(user.balance)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-medium text-cyan-400">
                                                    {formatCurrency(user.totalInvoiced)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {user.paidTransactions}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${user.pendingTransactions > 0
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-neutral-700/50 text-neutral-500'
                                                    }`}>
                                                    <Clock className="w-3 h-3" />
                                                    {user.pendingTransactions}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {user.associatedUsers}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredAndSortedUsers.length === 0 && (
                                <div className="text-center py-12 text-neutral-400">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{searchTerm ? 'Nenhum usuário encontrado para a pesquisa' : 'Nenhum usuário encontrado'}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<AdminSkeleton />}>
            <AdminContent />
        </Suspense>
    );
}
