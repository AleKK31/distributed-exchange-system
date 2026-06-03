# Descrição Arquitetural — Marketplace de Trocas (v 0.0.1)

## 1. Arquitetura do sistema

O sistema é composto por microsserviços independentes que se comunicam via HTTP (chamadas síncronas) e AMQP (mensagens assíncronas via RabbitMQ). O diagrama abaixo ilustra os principais componentes e seus relacionamentos.

[img]

---

## 2. Principais componentes

### WEB Client
Parte do sistema com a qual o usuário interage diretamente. Desenvolvido com ?, acessa o sistema via chamadas HTTPS ao NGINX. Mantém uma conexão **WebSocket** aberta com o Sv. Notificação para receber alertas em tempo real sem necessidade de recarregar a página.

### NGINX
Recebe todas as requisições HTTPS do cliente e as encaminha via HTTP para o serviço apropriado. Isola os serviços internos da comunicação direta com o cliente, adicionando uma camada de segurança.

### Base de Dados
Sistema gerenciador de banco de dados **PostgreSQL** utilizado para persistir as informações. Cada serviço que precisa de persistência se comunica com o banco via protocolo **TCP**.

### Serviço de Usuários
Responsável pelo gerenciamento do cadastro e perfil dos usuários,. Recebe requisições do NGINX e se comunica com o banco de dados para criar, atualizar e consultar dados de usuários.

Também é responsável pela autenticação dos usuários via **JWT**. Recebe as credenciais pelo NGINX, valida no banco de dados e retorna o token de acesso. O token é utilizado nas demais chamadas para garantir que apenas usuários autenticados publiquem itens e interajam com propostas.

### Serviço de Publicações
Responsável pelo gerenciamento dos itens cadastrados para troca. Recebe requisições do NGINX, persiste os dados no banco e publica eventos no **RabbitMQ** via AMQP. Também consome o evento `match.aceito` para atualizar o status dos itens envolvidos em uma troca confirmada.

### Serviço de Match
Possui a regra de negócio do sistema de trocas. Funciona como um **worker** que consome eventos do RabbitMQ. Ao receber uma nova publicação, busca no banco de dados um item compatível (onde o que o usuário X oferece é o que o usuário Y deseja, e vice-versa). Após encontrar um par, publica os eventos de resultado de volta no RabbitMQ.

### Serviço de Notificação
Consome os eventos de match do RabbitMQ e entrega as notificações em tempo real para os usuários via **WebSocket**.

### RabbitMQ
Broker de mensagens central do sistema. Implementa o protocolo **AMQP** com exchange do tipo `topic`, permitindo múltiplos consumers para o mesmo evento. Garante que nenhuma mensagem se perca mesmo que um serviço esteja temporariamente indisponível. Mensagens com TTL configurado expiram para a **Dead Letter Exchange (DLX)**, que trata publicações sem par dentro do prazo.

---

## 3. Principais fluxos do sistema

### Fluxo de Cadastro de Usuário
Iniciado no WEB Client, o novo usuário preenche nome, e-mail e senha. A requisição é enviada ao NGINX que a encaminha ao Sv. Usuários. Esse serviço valida os dados, persiste no banco de dados e retorna confirmação ao cliente.

### Fluxo de Login
Iniciado no WEB Client com e-mail e senha. O NGINX encaminha ao Sv. Usuários, que valida as credenciais no banco de dados. Em caso de sucesso, retorna um **token JWT** ao cliente, que será usado nas chamadas subsequentes.

### Fluxo de Publicação de Item para Troca
Iniciado no WEB Client, o usuário autenticado cadastra um item informando o que oferece e o que deseja em troca. O NGINX encaminha a requisição ao Sv. Publicações, que persiste os dados no banco e publica o evento `publicacao.criada` no RabbitMQ. O Sv. Match consome esse evento e inicia a busca por um par compatível.

### Fluxo de Match Encontrado
Após receber o evento `publicacao.criada`, o Sv. Match consulta o banco em busca de um item onde o `item_oferto` seja igual ao `item_desejado` do novo item, e vice-versa. Ao encontrar um par, publica `match.encontrado` no RabbitMQ. O Sv. Notificação consome esse evento e envia via WebSocket para os dois usuários envolvidos.

### Fluxo de Confirmação da Troca
Cada usuário responde à proposta pelo WEB Client. O NGINX encaminha a resposta ao Sv. Match. Quando ambos aceitam, o Sv. Match publica `match.aceito` no RabbitMQ. O Sv. Publicações consome esse evento e marca os dois itens como *"trocado"* no banco. O Sv. Notificação consome o mesmo evento e notifica os dois usuários via WebSocket.

### Fluxo de Recusa ou Expiração
Se um dos usuários recusar a proposta, o Sv. Match publica `match.recusado`. O Sv. Notificação avisa ambos os usuários e os itens voltam ao estado *"disponível"* para novo matching. Se nenhum dos dois responder dentro do prazo configurado, o TTL da mensagem expira e ela é enviada para a DLX, que dispara o evento `match.expirado` com o mesmo efeito.

---

## 4. Definição das interfaces de serviço


---

## 5. Tecnologias utilizadas


---

## 6. Dependências


---

## 7. Como executar


---

## 8. Alunos

- Alexandre Borges Baccarini Junior - 2515520 
- Leonardo Naime Lima - 2515660