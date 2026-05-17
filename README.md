# Coachdazet Formation — Guide de déploiement

Plateforme LMS (Learning Management System) pour la formation finances personnelles Coachdazet.

---

## Stack technique

- **Frontend & Backend** : Next.js 14 (App Router, TypeScript)
- **Styles** : Tailwind CSS avec les couleurs Coachdazet (Navy #1B2B5E, Terracotta #C0603A)
- **Base de données & Auth** : Supabase (PostgreSQL + Auth)
- **Vidéos** : Bunny.net Stream (iframe embed)
- **Fichiers** : Supabase Storage
- **Emails transactionnels** : Resend
- **Déploiement** : Vercel (frontend) + Supabase (BDD)

---

## 1. Pré-requis

- Compte [Supabase](https://supabase.com) (gratuit pour commencer)
- Compte [Resend](https://resend.com) (gratuit jusqu'à 3 000 emails/mois)
- Compte [Bunny.net Stream](https://bunny.net) (pay-as-you-go, ~2-5€/mois)
- Compte [Vercel](https://vercel.com) (gratuit pour un projet)
- Node.js 18+ installé localement

---

## 2. Configuration Supabase

### 2a. Créer un projet

1. Allez sur [supabase.com](https://supabase.com) → Nouveau projet
2. Notez votre **Project URL** et votre **anon key** (Settings → API)
3. Notez aussi la **service_role key** (gardez-la secrète !)

### 2b. Créer le schéma de base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez-collez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
3. Cliquez sur **Run**

Ce script crée toutes les tables, politiques RLS, et les 5 modules de base.

### 2c. Créer le bucket de stockage pour les ressources

1. Dans Supabase → **Storage** → **New bucket**
2. Nom : `resources`
3. **Public bucket** : NON (les fichiers sont privés)
4. Cliquez sur **Create bucket**

### 2d. Créer le compte administrateur

1. Dans Supabase → **Authentication** → **Users** → **Add user**
2. Email : votre email admin (ex: rdazet@hotmail.com)
3. Password : choisissez un mot de passe fort
4. Cliquez sur **Create user**
5. Notez l'UUID du nouvel utilisateur

Ensuite, dans le **SQL Editor**, mettez à jour le profil en admin :

```sql
UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE email = 'rdazet@hotmail.com';
```

---

## 3. Configuration Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Ajoutez et vérifiez votre domaine `coachdazet.com` (DNS TXT record)
3. Créez une **API Key** et copiez-la

---

## 4. Variables d'environnement

Copiez le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Remplissez toutes les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=https://formation.coachdazet.com

RESEND_API_KEY=re_xxxx
EMAIL_FROM=Coachdazet Formation <formation@coachdazet.com>
ADMIN_EMAIL=rdazet@hotmail.com

APPROVAL_SECRET=votre_secret_aleatoire_32_chars
```

Pour générer l'APPROVAL_SECRET :
```bash
openssl rand -hex 32
```

---

## 5. Lancer en local

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 6. Déploiement sur Vercel

1. Poussez le code sur GitHub (nouveau repo)
2. Allez sur [vercel.com](https://vercel.com) → **New Project** → importez le repo
3. Dans **Environment Variables**, ajoutez toutes les variables du `.env.local`
4. Cliquez sur **Deploy**
5. Dans les settings du projet Vercel, ajoutez votre domaine `formation.coachdazet.com`
6. Configurez le DNS chez votre registrar (CNAME vers `cname.vercel-dns.com`)

---

## 7. Configurer Supabase Auth pour la production

Dans Supabase → **Authentication** → **URL Configuration** :
- **Site URL** : `https://formation.coachdazet.com`
- **Redirect URLs** : `https://formation.coachdazet.com/**`

---

## 8. Ajouter des vidéos (workflow)

### Uploader une vidéo sur Bunny.net Stream

1. Créez un compte Bunny.net → Stream → New Library
2. Uploadez votre vidéo
3. Copiez l'URL d'embed (format : `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`)
4. Dans l'admin de la plateforme (`/admin/contenu`), ajoutez la vidéo avec cette URL

### Uploader une ressource (PDF/PPTX/XLSX)

1. Dans Supabase → **Storage** → bucket `resources`
2. Uploadez le fichier
3. Copiez le **path** du fichier (ex: `module1/slides.pptx`)
4. Utilisez l'API `/api/admin/content/resources` pour lier le fichier à une vidéo

---

## 9. Accéder à l'interface admin

URL : `https://formation.coachdazet.com/admin`

Connectez-vous avec le compte admin créé à l'étape 2d.

---

## 10. Flux d'approbation des clients

1. Un client s'inscrit sur `/inscription`
2. Un email est envoyé automatiquement à `rdazet@hotmail.com`
3. L'email contient deux boutons : **Approuver** et **Refuser**
4. Un clic suffit — aucune connexion requise
5. Le client reçoit instantanément un email de bienvenue (si approuvé)

---

## Structure du projet

```
coachdazet-formation/
├── app/
│   ├── (auth)/           # Pages publiques (connexion, inscription)
│   ├── (platform)/       # Pages privées (dashboard, formation)
│   ├── admin/            # Interface administrateur
│   └── api/              # Routes API (auth, progress, admin)
├── components/
│   ├── layout/           # Sidebar desktop & mobile
│   └── video/            # Lecteur vidéo, bouton complétion
├── lib/
│   ├── supabase/         # Client Supabase (browser, server, middleware)
│   └── email/            # Templates email & envoi (Resend)
├── supabase/
│   └── migrations/       # SQL schema à exécuter dans Supabase
├── types/                # Types TypeScript
└── .env.example          # Variables d'environnement à configurer
```

---

## Phases suivantes (V2 / V3)

- **Phase 2** : Exercices interactifs (dropdown, numérique, texte libre) avec export Excel
- **Phase 3** : Certificat de complétion PDF, tableau de bord analytics admin

---

*Coachdazet Formation — Version 1.0 — Mai 2026*
