# AluguelBabyLover - Sistema de Locação Infantil

Sistema completo de locação de produtos infantis com foco em experiência web responsiva e premium.

## Tecnologias
- **React Native / Expo** (Web)
- **Expo Router** (Navegação baseada em arquivos)
- **TypeScript** (Tipagem forte)
- **Supabase** (Backend, Banco de Dados e Storage)
- **NativeWind / TailwindCSS** (Estilização)
- **React Query** (Gerenciamento de estado de servidor)
- **React Hook Form + Zod** (Formulários e Validação)
- **@react-pdf/renderer** (Geração de Contratos em PDF)

## Requisitos Prévios
- Node.js instalado
- Conta no Supabase

## Configuração do Supabase
1. Crie um novo projeto no [Supabase](https://supabase.com).
2. Execute o SQL contido em `supabase/schema.sql` no Editor SQL do seu projeto.
3. Crie os seguintes buckets no **Storage**:
   - `product-images` (Acesso público)
   - `contracts` (Acesso público para este MVP)
   - `signatures` (Acesso público para este MVP)
4. Execute `supabase/fix-permissions.sql` no SQL Editor (obrigatório para o site finalizar aluguéis sem login).
5. Copie suas credenciais (URL e Anon Key) do painel de configurações da API.

### Erro "Permissão negada no servidor"
Execute `supabase/fix-permissions.sql` e confira no Supabase **Storage** se existem os buckets `signatures` e `contracts` (pode marcar como públicos).

## Instalação Local
1. Clone o repositório ou baixe os arquivos.
2. Crie um arquivo `.env` na raiz baseado no `.env.example`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run web
   ```

## Estrutura de Pastas
- `/app`: Rotas e páginas do sistema.
- `/components`: Componentes de UI e lógica de negócio.
- `/services`: Integração com Supabase e serviços externos.
- `/hooks`: Hooks customizados (React Query).
- `/lib`: Configurações de bibliotecas (Supabase client).
- `/types`: Definições TypeScript.
- `/utils`: Funções utilitárias.
- `/styles`: CSS Global e temas.

## Funcionalidades
- Catálogo de produtos com filtros.
- Detalhes completos e galeria.
- Agendamento de datas e horários.
- Formulário de contrato com assinatura digital.
- Geração automática de PDF e upload para Storage.
- Consulta de aluguéis por CPF ou Telefone.
