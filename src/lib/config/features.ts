// Feature flags — permitem desativar funcionalidades sem apagar código,
// para reativação futura simples.

// Mensagens internas entre utilizadores — desativado por conformidade com o
// Digital Services Act. O contacto passa a ser feito diretamente por
// WhatsApp/telefone/email (ver ContactInfo.tsx). As rotas /mensagens e o
// código de suporte (ChatWindow, ConversationList, actions) mantêm-se no
// repositório, apenas deixam de estar acessíveis a partir da interface.
export const MESSAGING_ENABLED = false;
