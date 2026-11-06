# WebBilly • Infraestrutura Oficial Billy Suite (www.webbilly.com.br)

Plataforma oficial construída em **Next.js (App Router)** e **Tailwind CSS** para o ecossistema Billy Suite, integrando o funil de recrutamento de operadores comerciais remotos, emissão e validação de Tokens Seriais com Hardware Lock, painel administrativo centralizado (Master) e painel exclusivo do operador comercial.

---

## 🚀 Arquitetura e Módulos Entregues

### 1. Landing Page & Funil de Candidatura (`/`)
- **Hero Persuasivo**: Posicionamento focado em atrair SDRs e Closers remotos para venda comissionada a **R$ 200,00 por site**.
- **Calculadora de Comissões Interativa**: Sliders dinâmicos de vendas/dia e dias/semana com cálculo em tempo real de faturamento semanal, mensal (R$ 4.000 a R$ 16.000+) e projeção anual.
- **Seção "Como Funciona a Tecnologia"**: Fluxo em 4 passos ilustrando a prospecção no Google Maps, geração de sites em segundos com IA Gemini, demonstração no WhatsApp e recebimento instantâneo via Pix.
- **Formulário de Inscrição Oficial**:
  - Nome completo, E-mail, WhatsApp (com máscara e DDD), Cidade/UF.
  - Chave Pix (Tipo: CPF, CNPJ, Telefone, E-mail, Aleatória + Chave).
  - LinkedIn/Currículo e experiência prévia.
  - Checkbox obrigatório e modal completo com o **Contrato de Parceria Autônoma e Confidencialidade Billy Suite**.
  - Submissão via API com status inicial **`PENDENTE`** e efeito comemorativo (confetti).

---

### 2. Painel Master Admin (`/admin` e `/admin/login`)
- **Autenticação JWT Segura**: Usuário Master (`admin@billysuite.com.br` / `admin123456`).
- **Funil de Candidatos**:
  - Filtros por status (Todos, Pendentes, Aprovados, Recusados).
  - WhatsApp com link direto `wa.me`, Chave Pix e LinkedIn.
  - **Aprovar com 1 clique**: Gera instantaneamente o Token Serial único (`BILLY-OP-XXXX-XXXX-2026`), cria a conta do operador com senha inicial e gera notificação automática de onboarding.
  - **Recusar**: Atualiza status e registra motivo.
- **Gestor de Licenças & Seriais**:
  - Listagem dos Seriais no formato oficial `BILLY-OP-XXXX-XXXX-2026`.
  - Status em tempo real (`ATIVO`, `EM_USO`, `BLOQUEADO`).
  - **Hardware Lock**: Exibe o Machine ID registrado e SO.
  - **Bloqueio em Tempo Real**: Botão para bloquear operador (revoga acesso instantaneamente no próximo heartbeat do Electron).
  - **Liberar PC**: Desvincula a máquina para permitir migração para outro computador.
- **Controle Central de APIs**:
  - Gestão de credenciais: Google Gemini API Key, Modelo Gemini (`gemini-3.8-flash`), Cloudflare Pages (Account ID & Token), Vercel Token e Gateway Pix.
  - Limite diário de gerações por operador (ex: 50 sites/dia).
- **Extrato Financeiro Global**:
  - Faturamento Total, Comissões a Pagar, Comissões Pagas e Lucro Líquido Central.
  - Tabela de Vendas com botão de liquidação de comissão via Pix.

---

### 3. Painel do Operador Comercial (`/operador` e `/operador/login`)
- **Autenticação**: Acesso com e-mail e senha cadastrados (`carlos.operador@billysuite.com.br` / `operador123`).
- **Card de Ativação do Token Serial**: Exibição do token oficial `BILLY-OP-XXXX-XXXX-2026` com botão de cópia de 1 clique e status da licença.
- **Área de Download**: Botão para download do executável oficial `Billy-Suite-Setup-2.0.4.exe` com guia passo a passo.
- **Área de Treinamento Integrada**: Player de vídeo com 4 módulos fundamentais (Instalação, Garimpo no Maps, IA Gemini em 60s, Scripts de WhatsApp e Fechamento no Pix) e downloads de materiais de apoio.
- **Dashboard de Vendas Pessoais**: Contadores de vendas concluídas pelo seu ID, comissões acumuladas, status do Pix e conferência de chave Pix cadastrada.

---

### 4. Endpoints REST da API de Licenças
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/candidates` | Submissão de novas candidaturas (status PENDENTE). |
| `POST` | `/api/candidates/review` | Aprovação (gera serial único) ou recusa (Master Admin). |
| `POST` | `/api/license/activate` | Ativação da licença no Electron com Hardware Lock. |
| `POST` | `/api/license/heartbeat` | Validação a cada 15 min do status e bloqueio em tempo real. |
| `POST` | `/api/license/record-sale` | Registro de venda fechada atribuída ao `operatorId`. |
| `GET` | `/api/admin/overview` | Métricas financeiras, operadores, licenças e configurações. |
| `POST` | `/api/admin/settings` | Atualização das credenciais centrais de API e limites. |
| `POST` | `/api/admin/license/block` | Bloqueio/desbloqueio e reset de máquina. |
| `GET` | `/api/operator/overview` | Dados da licença, vendas e treinamentos do operador. |

---

### 5. Integração com o App Desktop Electron (`BILLY`)
- **Módulo `LicenseManager`** (`src/main/services/license-manager.js`):
  - Geração de Machine ID persistente com base em hardware lock SHA-256.
  - Armazenamento seguro de sessão.
  - Heartbeat periódico a cada 15 minutos via timer em background.
  - Evento de revogação imediata (`license:revoked`) disparado para a interface.
- **Tela de Ativação Limpa** (`LicenseActivationScreen.jsx`):
  - Solicitada automaticamente na inicialização se não houver licença ativa salva.
  - Input para o Token Serial do Operador com validação no backend WebBilly.
- **Modo Operador Restrito**:
  - Aba de **Configurações oculta** na Sidebar do aplicativo desktop.
  - Credenciais de API centralizadas injetadas dinamicamente na inicialização e no heartbeat.
  - Crachá do operador com serial e status online no Sidebar.
