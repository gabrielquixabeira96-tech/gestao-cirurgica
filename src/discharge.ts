export const getDischargeText = (doctorName: string) => {
  const isRafael = doctorName && doctorName.toUpperCase().includes('RAFAEL');
  
  if (isRafael) {
    return [
      {
        section: 'Cuidados com a Ferida Operatória',
        items: [
          { title: 'Higiene', text: 'Lave a região da incisão diariamente durante o banho, utilizando água e sabonete neutro. Não esfregue o local.' },
          { title: 'Secagem', text: 'Seque a ferida com uma toalha limpa separada apenas para isso, encostando suavemente, sem esfregar.' },
          { title: 'Curativo', text: 'Mantenha o local limpo e seco. Troque o curativo conforme a orientação da equipe médica. Se a ferida estiver descoberta, deixe-a arejar.' },
          { title: 'Proteção ao tossir/espirrar', text: 'Sempre que precisar tossir, rir ou espirrar, abrace um travesseiro firmemente contra o abdome. Isso reduz a pressão sobre os pontos e alivia a dor.' },
          { title: 'Exposição Solar', text: 'Evite tomar sol diretamente na cicatriz por pelo menos 6 meses para evitar o escurecimento definitivo da pele.' }
        ]
      },
      {
        section: 'Alimentação e Hidratação',
        items: [
          { title: 'Dieta', text: 'Dê preferência a refeições leves, com pouca gordura e fáceis de digerir. Evite alimentos que causam gases (como feijão, repolho, brócolis, refrigerantes e frituras) nos primeiros dias, pois a distensão abdominal causa dor.' },
          { title: 'Fibras e Água', text: 'Beba bastante água (cerca de 2 litros por dia) e consuma alimentos ricos em fibras (frutas, verduras, aveia). O intestino pode ficar "preguiçoso" após a cirurgia e devido aos analgésicos. Fazer força para evacuar pode forçar a cirurgia.' }
        ]
      },
      {
        section: 'Repouso e Atividades Físicas',
        items: [
          { title: 'Movimentação Leve', text: 'O repouso não deve ser absoluto na cama. Caminhe devagar pela casa várias vezes ao dia. Isso ajuda a eliminar gases e previne a formação de trombose nas pernas.' },
          { title: 'Esforço Físico', text: 'É estritamente proibido pegar peso (geralmente acima de 3 a 5 kg), empurrar móveis, varrer ou fazer esforços abdominais intensos por 30 a 60 dias, dependendo da liberação médica.' },
          { title: 'Direção', text: 'Não dirija nas primeiras semanas. Os movimentos bruscos com os pés e os reflexos exigem força abdominal, além do cinto de segurança ficar posicionado sobre a ferida.' },
          { title: 'Posição para dormir', text: 'Durma de barriga para cima nos primeiros dias. Para se levantar da cama, vire-se de lado, coloque as pernas para fora e use a força dos braços para erguer o tronco.' }
        ]
      },
      {
        section: 'Medicações',
        items: [
          { title: 'Analgésicos e Anti-inflamatórios', text: 'Tome rigorosamente nos horários prescritos para evitar que a dor fique muito forte.' },
          { title: 'Antibióticos', text: 'Se receitados, tome até o final do período indicado, mesmo que você já esteja se sentindo bem.' }
        ]
      },
      {
        section: 'Sinais de Alerta (Quando procurar o Pronto-Socorro imediatamente)',
        items: [
          { title: 'Febre', text: 'Temperatura axilar superior a 37,8°C.' },
          { title: 'Dor Intensa', text: 'Dor abdominal forte que não melhora de jeito nenhum com as medicações prescritas, ou que piora repentinamente.' },
          { title: 'Sintomas Gastrointestinais', text: 'Vômitos persistentes que impedem a alimentação ou parada total da eliminação de gases e fezes por vários dias, acompanhada de barriga muito estufada.' },
          { title: 'Sinais na Ferida', text: 'Abertura dos pontos (deiscência), vermelhidão intensa ao redor da ferida, calor local, sangramento ativo ou saída de pus/líquido com mau cheiro.' }
        ]
      },
      {
        section: 'Retorno Médico',
        items: [
          { title: '', text: 'Compareça à consulta de retorno na data e horário agendados para a avaliação da ferida, retirada dos pontos (se necessário) e ajuste das orientações de rotina.' }
        ]
      }
    ];
  }

  // Default (Dra Bianca)
  return [
    {
      section: 'Cuidados com a Ferida Operatória',
      items: [
        { title: 'Limpeza', text: 'Lave a região da incisão diariamente com água e sabonete neutro durante o banho.' },
        { title: 'Secagem', text: 'Seque o local suavemente com uma toalha limpa, apenas encostando, sem esfregar.' },
        { title: 'Curativos', text: 'Mantenha a ferida descoberta ou use apenas o curativo recomendado pelo seu cirurgião (como fita microporosa).' },
        { title: 'Proteção Solar', text: 'É fundamental proteger a cicatriz do sol por pelo menos 6 meses (usando lenços, roupas com gola ou protetor solar após a liberação médica) para evitar que a marca escureça.' },
        { title: 'Sensibilidade', text: 'É normal sentir a região do pescoço um pouco "adormecida" ou com um leve inchaço (endurecimento) acima da cicatriz. Isso melhora gradativamente com as semanas.' }
      ]
    },
    {
      section: 'Medicações e Suplementação',
      items: [
        { title: 'Hormônio Tireoidiano (Levotiroxina)', text: 'Como a tireoide foi totalmente removida, você precisará tomar este hormônio diariamente. Ele deve ser ingerido em jejum, com água, aguardando pelo menos 30 a 60 minutos antes de tomar café da manhã ou outras medicações.' },
        { title: 'Cálcio e Vitamina D', text: 'As glândulas paratireoides (que controlam o cálcio) ficam coladas na tireoide e podem "adormecer" temporariamente após a cirurgia. Tome o cálcio rigorosamente nos horários prescritos.' },
        { title: 'Analgésicos e Anti-inflamatórios', text: 'Utilize conforme a receita médica para controle da dor, que costuma ser leve a moderada nos primeiros dias.' }
      ]
    },
    {
      section: 'Alimentação e Fala',
      items: [
        { title: 'Dieta', text: 'A alimentação é livre, mas nos primeiros dias você pode sentir um leve incômodo ao engolir (semelhante a uma dor de garganta). Prefira alimentos macios, pastosos e em temperatura ambiente ou frios para maior conforto.' },
        { title: 'Voz', text: 'É comum a voz ficar um pouco rouca, fraca ou cansada após falar muito. Fale normalmente, sem forçar ou sussurrar, e descanse a voz se sentir fadiga.' }
      ]
    },
    {
      section: 'Repouso e Atividades Físicas',
      items: [
        { title: 'Movimentação', text: 'Não deixe o pescoço totalmente rígido; faça movimentos suaves para os lados para evitar dores musculares, mas evite esticar o pescoço para trás bruscamente.' },
        { title: 'Esforço', text: 'Evite levantar peso superior a 5 kg e não faça atividades físicas intensas (como academia ou corrida) nos primeiros 15 a 30 dias, conforme orientação médica.' },
        { title: 'Direção', text: 'Evite dirigir nos primeiros 7 a 10 dias, pois a dor e a restrição de movimento no pescoço podem prejudicar seus reflexos no trânsito.' }
      ]
    },
    {
      section: 'Sinais de Alerta (Quando procurar o Pronto-Socorro imediatamente)',
      items: [
        { title: 'Sintomas de Falta de Cálcio', text: 'Formigamento intenso ou dormência ao redor da boca, nos lábios, ou nas pontas dos dedos das mãos e dos pés, além de cãibras.' },
        { title: 'Sintomas de Sangramento', text: 'Inchaço súbito e rápido na região do pescoço (como uma "bola" que cresce), acompanhado de sensação de sufocamento.' },
        { title: 'Dificuldade Respiratória', text: 'Falta de ar intensa ou respiração com ruído alto (estridor).' },
        { title: 'Sinais de Infecção', text: 'Febre (acima de 37,8°C), vermelhidão intensa, calor ou saída de pus pela ferida.' }
      ]
    },
    {
      section: 'Retorno Médico',
      items: [
        { title: '', text: 'Compareça à consulta de retorno na data agendada para avaliação da cicatriz e análise do resultado da biópsia (exame anatomopatológico).' }
      ]
    }
  ];
};
