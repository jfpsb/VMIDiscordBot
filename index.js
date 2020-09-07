const Discord = require('discord.js');
const Bot = new Discord.Client();
const Token = 'NzUyMzE0MDUzNTM5NTI4Nzg0.X1V1Dw.d-3tw0JxpKMo3P170Ma_xfmNPZw';
var Felipe, FerreiraBorges, Channels;
var OnCallChannelMap = new Map();

Bot.login(Token);

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
            channel.send("1. Quando houver uma troca, anote o(s) produto(s) (código de barras ou referência no sistema) devolvido(s) e a quantidade devolvida;\n" +
                "2. O valor referente aos produtos devolvidos serão considerados como CRÉDITO EM TROCA para o cliente;\n" +
                "3. Passe os novos itens que o cliente escolheu em uma nova venda;\n" +
                "4. Na forma de pagamento insira o valor do CRÉDITO EM TROCA como pagamento em DINHEIRO;\n" +
                "5. Se houver diferença, insira essa diferença com a forma de pagamento que o cliente escolher (Crédito, Débito ou Dinheiro);\n" +
                "6. Finalize a venda. Abra a tela de fechamento de caixa e insira como DESPESA o crédito em troca com o valor das mercadorias devolvidas pelo cliente. Coloque a descrição da troca como CRÉDITO EM TROCA;\n" +
                "7. Envie por aqui os produtos devolvidos e as quantidades.");
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
        case "!comandos":
            channel.send("Comandos disponíveis:\n" +
                "!comandos, !troca, !fechamentocaixa, !aberturacaixa");
            break;
    }

    if (message.author === FerreiraBorges) return;

    if (message.author === Felipe) {
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
            message.reply("Felipe não está no computador Agora. Aguarde.");
        } else if (Felipe.presence.status === 'online') {
            message.reply("Felipe está resolvendo a solicitação. Aguarde.");
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