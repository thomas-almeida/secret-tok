import os
import subprocess
import argparse

def compress_videos(input_dir, output_dir, crf=23, preset='medium'):
    """
    Compresses all MP4 videos in the input_dir and saves them to the output_dir.

    Args:
        input_dir (str): The directory containing the original videos.
        output_dir (str): The directory where compressed videos will be saved.
        crf (int): Constant Rate Factor for video quality (0-51, lower is better quality).
        preset (str): Encoding speed vs. compression efficiency (e.g., 'medium', 'slow', 'fast').
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")

    for filename in os.listdir(input_dir):
        if filename.endswith('.mp4'):
            input_filepath = os.path.join(input_dir, filename)
            output_filepath = os.path.join(output_dir, f"compressed_{filename}")

            if os.path.exists(output_filepath):
                print(f"Skipping {filename}: {output_filepath} already exists.")
                continue

            print(f"Compressing {filename}...")
            command = [
                'ffmpeg',
                '-i', input_filepath,
                '-vcodec', 'libx264',
                '-crf', str(crf),
                '-preset', preset,
                '-y',  # Overwrite output files without asking
                output_filepath
            ]

            try:
                subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                print(f"Successfully compressed {filename} to {output_filepath}")
            except subprocess.CalledProcessError as e:
                print(f"Error compressing {filename}:")
                print(f"Command: {' '.join(e.cmd)}")
                print(f"Stderr: {e.stderr.decode()}")
            except FileNotFoundError:
                print("Error: ffmpeg command not found. Please ensure ffmpeg is installed and in your system's PATH.")
                return

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compress MP4 videos using ffmpeg.")
    parser.add_argument("--input_dir",
                        default="public/videos/queue/premium",
                        help="Input directory containing MP4 videos.")
    parser.add_argument("--output_dir",
                        default="public/videos/queue/premium_compressed",
                        help="Output directory for compressed videos.")
    parser.add_argument("--crf",
                        type=int,
                        default=23,
                        help="Constant Rate Factor (CRF) for video quality (0-51, lower is better).")
    parser.add_argument("--preset",
                        default="medium",
                        help="FFmpeg preset for encoding speed vs. compression efficiency (e.g., 'medium', 'slow').")

    args = parser.parse_args()

    # Ensure the script is run from the project root or adjust paths accordingly
    # This assumes the script is run from /home/thomdev/dev/secret-tok/frontend
    project_root = os.getcwd()
    input_full_path = os.path.join(project_root, args.input_dir)
    output_full_path = os.path.join(project_root, args.output_dir)

    print(f"Starting video compression process...")
    print(f"Input Directory: {input_full_path}")
    print(f"Output Directory: {output_full_path}")
    print(f"CRF: {args.crf}, Preset: {args.preset}")

    compress_videos(input_full_path, output_full_path, args.crf, args.preset)
    print("Video compression process finished.")
