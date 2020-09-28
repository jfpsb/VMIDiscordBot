const Discord = require('discord.js');
const Token = require('./token')
const Bot = new Discord.Client();
var Felipe, FerreiraBorges, Channels;
var OnCallChannelMap = new Map();
var CanalConsole;

Bot.login(Token.token());

Bot.on('ready', () => {
    console.log("Bot Está Online");
    Felipe = Bot.users.cache.get('280453891504603146');
    FerreiraBorges = Bot.users.cache.get('505188229948112896');
    CanalConsole = Bot.channels.cache.get('755875094311731320');
    setChannels();
});

Bot.on('message', async message => {
    if (message.author.bot) return;

    var channel = message.channel;
    var onCall = OnCallChannelMap.get(channel);

    switch (message.content) {
        case "!troca":
            await channel.send("1. Primeiro você irá inserir a DEVOLUÇÃO do(s) produto(s). Abra o módulo de administração do sistema. Ele possui este ícone", { files: ["imagens/iconeadmin.png"] });
            await channel.send("2. Insira seu usuário e senha (o mesmo que você usa para abrir caixa)", { files: ["imagens/telaloginadmin.png"] });
            await channel.send("3. No menu \"Estoque\", aperte no botão \"Trocas/Devoluções\"", { files: ["imagens/menuestoquebotaotroca.png"] });
            await channel.send("4. A tela de devolução irá abrir. Para selecionar o produto que está sendo devolvido, aperte na lupa ao lado de \"Cód. de Barras\"", { files: ["imagens/telatroca.png"] });
            await channel.send("5. Você pode pesquisar produtos por código de barras ou descrição. Aperte em cima do produto que está sendo devolvido e depois aperte em \"F5 - Lançar Produto\"", { files: ["imagens/pesquisaprodutoemtroca.png"] });
            await channel.send("6. Após selecionar o produto, escreva a quantidade sendo devolvida no campo \"Quantidade\".\n" +
                "7. Se possuir, informe o número do cupom da venda do produto que está sendo devolvido. Caso não tenha o número, deixe escrito \"0\" (zero).\n" +
                "8. Em \"Gerar Crédito p/ Cliente?\" deixe na opção \"Não\"", { files: ["imagens/telatrocaescolhercliente.png"] });
            await channel.send("09. Cheque se os dados estão corretos e então aperte em \"Salvar\"", { files: ["imagens/telatrocaconfirmedados.png"] });
            await channel.send("10. Após apertar em \"Salvar\", a devolução deve aparecer na lista", { files: ["imagens/telatrocaefetuadasucesso.png"] });

            await channel.send("AGORA PARA A NOVA VENDA:");
            await channel.send("1. Insira normalmente os produtos que o cliente irá levar.");
            await channel.send("2. Na tela de pagamento, selecione a forma de pagamento CRÉDITO EM TROCA e insira o valor das mercadorias sendo devolvidas pelo cliente",
                { files: ["imagens/telapagamentocreditoemtroca.png"] });
            await channel.send("3. Se houver diferença, insira da forma que o cliente pagar essa diferença. Finalize a venda normalmente",
                { files: ["imagens/telapagamentorestante.png"] });
            await channel.send("FIM DAS INSTRUÇÕES DE TROCA");
            break;
        case "!fechamentocaixa":
            channel.send("1. TODAS as despesas e retiradas do caixa devem ser inseridas no sistema antes do fechamento de caixa;\n" +
                "2. Se por algum motivo você digitar valores errados no fechamento de caixa e percebeu após fechar, deixe assim. NÃO abra o caixa novamente para inserir os valores corretos porque você estará abrindo um caixa totalmente diferente;\n" +
                "3. Confira todo o dinheiro presente no caixa e depois separe o troco. Guarde o troco. O restante do dinheiro deve ser inserido no fechamento de caixa;\n" +
                "4. Aguarde pela impressão do comprovante de fechamento de caixa.");
            break;
        case "!aberturacaixa":
            channel.send("1. Confira o troco presente no caixa;\n" +
                "2. Abra o caixa com o valor encontrado.");
            break;
        case "!notafiscal":
            channel.send("1. Após finalizar a venda, abrirá automaticamente a tela de envio de nota fiscal;\n" +
                "2. CASO O CLIENTE QUEIRA, digite o CPF ou CNPJ dele e o nome ou razão social. Ao finalizar esta etapa, APERTE NO BOTÃO VERDE onde tem escrito \"Confirmar\";\n" +
                "3. CASO O CLIENTE NÃO INFORME SEUS DADOS, aperte no botão do meio que tem escrito \"NÃO INFORMAR CPF\".\n", { files: ["imagens/enviarnfce.jpg"] });
            break;
        case "!comandos":
            channel.send("Comandos disponíveis:\n" +
                "!comandos, !troca, !fechamentocaixa, !aberturacaixa, !notafiscal");
            break;
    }

    // Canal de avisos não abre chamada
    if (channel.id === '503954874577190924') return;

    if (channel === CanalConsole) {
        // Se for comando
        if (message.content.startsWith("!")) {
            var palavras = message.content.split(' ');
            switch (palavras[0].toLowerCase()) {
                case "!situacao":
                    var mensagem = "Em Chamada:\n";
                    OnCallChannelMap.forEach((valor, chave) => {
                        mensagem += `${chave}: ${textoEmChamada(valor)}\n`;
                    });
                    CanalConsole.send(mensagem);
                    break;
                case "!end":
                    if (palavras.length == 2) {
                        if(palavras[1] === 'all') {
                            OnCallChannelMap.forEach((value, key) => {
                                OnCallChannelMap.set(key, false);
                            });
                            return;
                        }

                        var canalEndCall = Channels.filter(ch => {
                            return ch.name === palavras[1].toLowerCase();
                        });

                        if (canalEndCall.size == 0) {
                            channel.send(`Canal ${palavras[1].toLowerCase()} não existe.`);
                        }
                        else {
                            var id = canalEndCall.entries().next().value[1].id;
                            var canal = Bot.channels.cache.get(id);
                            channel.send(`A chamada em ${canal} foi encerrada.`);
                            OnCallChannelMap.set(canal, false);
                        }
                    }
                    break;
            }
        }
        return;
    }
    else {
        //Comandos nos canais das lojas não iniciam chamadas
        if (message.content.startsWith("!")) {
            CanalConsole.send(`Comando chamado por ${channel.name}`);
            return;
        }
    }

    // Caso o autor da mensagem seja Ferreira ou Felipe abre uma chamada mas não responde com aviso que abriu a chamada
    if (message.author === Felipe || message.author === FerreiraBorges) {
        if (!onCall) {
            OnCallChannelMap.set(channel, true);
        }

    }
    // Quando uma loja manda mensagem
    else {
        // Se estiver em chamada não teste por status de Felipe
        if (onCall) return;
        // Envia ao canal de console
        CanalConsole.send(`Chamada aberta por ${message.author}`);
        // Marca chamada como aberta
        OnCallChannelMap.set(channel, true);
        // Checa o status de Felipe
        if (Felipe.presence.status === 'idle') {
            message.reply("O computador de Felipe está ligado, mas ele não está nele agora. Aguarde.");
        } else if (Felipe.presence.status === 'offline') {
            message.reply("Felipe não está no computador agora. Aguarde.");
        } else if (Felipe.presence.status === 'online') {
            message.reply("Felipe está disponível.");
        } else {
            message.reply("Aguarde.");
        }
    }
});
Bot.on('channelCreate', guildChannel => {
    // Adiciona canal criado ao mapa de canais
    OnCallChannelMap.set(guildChannel, false);
});

Bot.on('channelDelete', guildChannel => {
    // Remove canal deletado de mapa
    OnCallChannelMap.delete(guildChannel);
});

function isTextChannel(channel) {
    // Retorna true se canal for de texto
    return channel.type === 'text';
}

function setChannels() {
    // Cria mapa de canais
    Channels = Bot.channels.cache.filter(isTextChannel);

    if (OnCallChannelMap.size > 0) {
        OnCallChannelMap.clear();
    }

    Channels.forEach((channel) => {
        if (channel !== CanalConsole)
            OnCallChannelMap.set(channel, false);
    });
}

function textoEmChamada(valor) {
    if (valor) {
        return "Sim";
    }
    return "Não";
}