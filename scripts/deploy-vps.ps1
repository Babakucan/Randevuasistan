# PowerShell Deployment Script for VPS
# Bu script VPS'e SSH ile bağlanıp deployment yapar

param(
    [string]$VpsIp = "72.61.89.17",
    [string]$VpsPassword = "3621344552aA.",
    [string]$VpsUser = "root"
)

Write-Host "🚀 VPS Deployment Başlatılıyor..." -ForegroundColor Yellow
Write-Host "VPS IP: $VpsIp" -ForegroundColor Cyan
Write-Host ""

# SSH komutlarını çalıştırma fonksiyonu
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Password = $VpsPassword
    )
    
    # SSH komutunu çalıştır (şifre manuel girilecek)
    Write-Host "🔄 Çalıştırılıyor: $Command" -ForegroundColor Yellow
    
    # SSH komutunu oluştur
    $sshCommand = "ssh -o StrictHostKeyChecking=no $VpsUser@$VpsIp `"$Command`""
    
    Write-Host "Komut: $sshCommand" -ForegroundColor Gray
    Write-Host "⚠️  Şifre girişi gerekebilir: $Password" -ForegroundColor Yellow
    Write-Host ""
    
    return $sshCommand
}

# Deployment komutları
$commands = @(
    "sudo apt update && sudo apt upgrade -y",
    "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs",
    "sudo apt install postgresql postgresql-contrib -y && sudo systemctl start postgresql && sudo systemctl enable postgresql",
    "sudo -u postgres psql -c \"DROP DATABASE IF EXISTS randevuasistan_db;\" -c \"DROP USER IF EXISTS randevuasistan;\" -c \"CREATE USER randevuasistan WITH PASSWORD 'RandevuAsistan2025!';\" -c \"CREATE DATABASE randevuasistan_db OWNER randevuasistan;\" -c \"GRANT ALL PRIVILEGES ON DATABASE randevuasistan_db TO randevuasistan;\"",
    "sudo apt install nginx -y && sudo systemctl start nginx && sudo systemctl enable nginx",
    "sudo npm install -g pm2",
    "cd /var/www && sudo rm -rf Randevuasistan && sudo git clone https://github.com/Babakucan/Randevuasistan.git && sudo chown -R `$USER:`$USER Randevuasistan",
    "cd /var/www/Randevuasistan/backend && npm install && npm run build",
    "cd /var/www/Randevuasistan/backend && npx prisma generate && npx prisma db push"
)

Write-Host "📋 Deployment Komutları:" -ForegroundColor Cyan
$commands | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

Write-Host "⚠️  Bu komutları VPS'te manuel olarak çalıştırmanız gerekiyor." -ForegroundColor Yellow
Write-Host "SSH ile bağlanın: ssh $VpsUser@$VpsIp" -ForegroundColor Cyan
Write-Host "Şifre: $VpsPassword" -ForegroundColor Yellow
Write-Host ""

# Komutları dosyaya kaydet
$commands | Out-File -FilePath "deploy-commands.txt" -Encoding UTF8
Write-Host "✅ Komutlar 'deploy-commands.txt' dosyasına kaydedildi!" -ForegroundColor Green

