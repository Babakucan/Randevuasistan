#!/bin/bash
# Bu script'i VPS'te çalıştırın

# Komutları tek tek çalıştırır
while IFS= read -r line; do
    # Yorum satırlarını ve boş satırları atla
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    
    echo "🔄 Çalıştırılıyor: $line"
    eval "$line"
    
    if [ $? -ne 0 ]; then
        echo "❌ Hata: $line"
        echo "Devam etmek için Enter'a basın, durdurmak için Ctrl+C..."
        read
    fi
done < deploy-vps-commands.txt

echo "✅ Tüm komutlar tamamlandı!"

