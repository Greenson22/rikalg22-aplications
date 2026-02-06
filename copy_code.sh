#!/bin/bash

# Nama folder tujuan
TARGET_DIR="temp_code"

# 1. Bersihkan folder tujuan lama jika ada (supaya bersih)
if [ -d "$TARGET_DIR" ]; then
    echo "Menghapus folder $TARGET_DIR lama..."
    rm -rf "$TARGET_DIR"
fi

# 2. Buat folder tujuan baru
echo "Membuat folder $TARGET_DIR..."
mkdir -p "$TARGET_DIR"

# 3. Copy folder 'src' ke dalam 'temp_code'
# Hasilnya: temp_code/src
if [ -d "src" ]; then
    echo "Mengcopy folder src..."
    cp -r src "$TARGET_DIR/"
else
    echo "Error: Folder 'src' tidak ditemukan!"
    exit 1
fi

# 4. Copy folder 'app' ke dalam 'temp_code/src'
# Hasilnya: temp_code/src/app
if [ -d "app" ]; then
    echo "Mengcopy folder app ke dalam src..."
    cp -r app "$TARGET_DIR/src/"
else
    echo "Peringatan: Folder 'app' tidak ditemukan, langkah ini dilewati."
fi

echo "----------------------------------------"
echo "Proses selesai! File berada di: $TARGET_DIR"