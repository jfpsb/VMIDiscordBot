const Discord = require('discord.js');
const Token = require('./token')
const Bot = new Discord.Client();
var Felipe, FerreiraBorges, Channels;
var OnCallChannelMap = new Map();

Bot.login(Token.token());

Bot.on('ready', () => {
    console.log("Bot Está Online");
    Felipe = Bot.users.cache.get('280453891504603146');
    FerreiraBorges = Bot.users.cache.get('505188229948112896');
    setChannels();
});

Bot.on('message', message => {
    if (message.author.bot) return;

    var channel = message.channel;
    var onCall = OnCallChannelMap.get(channel.id);

    switch (message.content) {
        case "!troca":
            channel.send("1. Abra o módulo de administração do sistema. Ele possui este ícone", { files: ["imagens/iconeadmin.png"] });
            channel.send("2. Insira seu usuário e senha (o mesmo que você usa para abrir caixa)", { files: ["imagens/telaloginadmin.png"] });
            channel.send("3. No menu \"Estoque\", aperte no botão \"Trocas/Devoluções\"", { files: ["imagens/menuestoquebotaotroca.png"] });
            channel.send("4. A tela de devolução irá abrir. Para selecionar o produto que está sendo devolvido, aperte na lupa ao lado de \"Cód. de Barras\"", { files: ["imagens/telatroca.png"] });
            channel.send("5. Você pode pesquisar produtos por código de barras ou descrição. Aperte em cima do produto que está sendo devolvido e depois aperte em \"F5 - Lançar Produto\"", { files: ["imagens/pesquisaprodutoemtroca.png"] });
            channel.send("6. Após selecionar o produto, escreva a quantidade sendo devolvida no campo \"Quantidade\".\n" +
                        "7. Se possuir, informe o número do cupom da venda do produto que está sendo devolvido. Caso não tenha o número, deixe escrito \"0\" (zero).\n" +
                        "8. Em \"Gerar Crédito p/ Cliente?\" aperte na opção \"Sim\" e depois aperte na lupa para escolher o cliente (se não marcar \"Sim\" a troca não irá ser efetuada", {files: ["imagens/telatrocaescolhercliente.png"]});
            channel.send("9. Escolha o cliente com nome \"CLIENTE CRÉDITO\". Clique nele com o mouse e depois clique em \"Ok\"", {files: ["imagens/telaescolherclienteemtroca.png"]});
            channel.send("10. Cheque se os dados estão corretos e então aperte em \"Salvar\"", {files: ["imagens/telatrocaconfirmedados.png"]});
            channel.send("11. Após apertar em \"Salvar\", a devolução deve aparecer na lista", {files: ["imagens/telatrocaefetuadasucesso.png"]});

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

    // Canal de avisos não abre call
    if (channel.id === '503954874577190924') return;
    if (message.author === FerreiraBorges) return;

    if (message.author === Felipe) {
        if (!onCall) {
            OnCallChannelMap.set(channel.id, true);
        }

        if (message.content.toLowerCase() === "silentlyendcall") {
            OnCallChannelMap.set(channel.id, false);
            message.delete();
        }

        if (message.content.toLowerCase() === 'endcall') {
            OnCallChannelMap.set(channel.id, false);
            channel.send("A chamada foi encerrada.")
            message.delete();
        }

        if (message.content.toLowerCase() === 'arrumei') {
            OnCallChannelMap.set(channel.id, false);
            channel.send("A chamada foi encerrada.")
        }
    } else {
        if (onCall) return;
        channel.send("Uma chamada foi iniciada.")
        OnCallChannelMap.set(channel.id, true);
        if (Felipe.presence.status === 'idle') {
            message.reply("O computador de Felipe está ligado, mas ele não está nele agora. Aguarde.");
        } else if (Felipe.presence.status === 'offline') {
            message.reply("Felipe não está no computador agora. Aguarde.");
        } else if (Felipe.presence.status === 'online') {
            message.reply("Felipe está disponível. Aguarde.");
        } else {
            message.reply("Aguarde.");
        }
    }
});
Bot.on('channelCreate', guildChannel => {
    OnCallChannelMap.set(guildChannel.id, false);
    console.log(OnCallChannelMap);
});

Bot.on('channelDelete', guildChannel => {
    OnCallChannelMap.delete(guildChannel.id);
    console.log(OnCallChannelMap);
});

function isTextChannel(channel) {
    return channel.type === 'text';
}

function setChannels() {
    Channels = Bot.channels.cache.filter(isTextChannel);

    if (OnCallChannelMap.size > 0) {
        OnCallChannelMap.clear();
    }

    Channels.forEach((channel) => {
        OnCallChannelMap.set(channel.id, false);
    });
}