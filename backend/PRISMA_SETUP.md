# Prisma Setup Rehberi

## PostgreSQL Veritabanı Kurulumu

### 1. PostgreSQL Kurulumu

PostgreSQL'in kurulu olması gerekiyor. Eğer kurulu değilse:
- Windows için: https://www.postgresql.org/download/windows/
- veya Docker ile: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

### 2. Veritabanı Oluşturma

PostgreSQL'e bağlanıp veritabanı oluşturun:

```sql
CREATE DATABASE randevuasistan;
```

### 3. Environment Değişkenlerini Ayarlayın

`backend/.env` dosyasını düzenleyin ve PostgreSQL connection string'ini ekleyin:

```
DATABASE_URL=postgresql://username:password@localhost:5432/randevuasistan?schema=public
```

Örnek:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/randevuasistan?schema=public
```

### 4. Prisma Migration

Environment değişkenleri ayarlandıktan sonra:

```bash
cd backend

# Migration oluştur ve uygula
npm run prisma:migrate

# Veya development için direkt push (schema değişikliklerini direkt uygula)
npm run prisma:push
```

### 5. Prisma Studio (Opsiyonel)

Database'i görsel olarak incelemek için:

```bash
npm run prisma:studio
```

## Notlar

- Migration çalıştırmadan önce DATABASE_URL'in doğru olduğundan emin olun
- İlk migration'da tüm tablolar oluşturulacak
- Prisma Studio database'i görselleştirmek için kullanılabilir

