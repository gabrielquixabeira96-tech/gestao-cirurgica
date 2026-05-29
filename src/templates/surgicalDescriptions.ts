export const drRafaelTemplates = {
  histerectomia_total: `Histerectomia Total:
 RELATÓRIO DE DESCRIÇÃO CIRÚRGICA
Procedimentos Realizados:

Histerectomia Total Extrafascial com Anexectomia Bilateral.

Linfadenectomia Pélvica Sistemática e Para-aórtica Estendida.

Lise de Aderências Complexas Pélvicas e Interentéricas.

Drenagem de Abscesso Tubo-ovariano.

Omentectomia Infracólica e Biópsias Peritoneais.

Desbridamento Cortante de Parede Abdominal e Colocação de Tela (Curativo Grau II).

Anestesia: Geral.
Posicionamento: Decúbito dorsal e litotomia.

TEMPOS CIRÚRGICOS:
1. Preparo e Mapeamento Linfático:

Realizada injeção cervical de indocianina verde (ICG) às 3 e 9 horas (submucosa e estroma profundo) para mapeamento de linfonodo sentinela.

2. Acesso e Inventário da Cavidade:

Acesso à cavidade abdominal evidenciando extenso plastrão aderencial pélvico e abscesso tubo-ovariano bloqueado.

Nota Estratégica: Tais achados configuram lesões de etiologias distintas em relação à neoplasia uterina primária de base.

3. Lise de Aderências e Drenagem (Tempo Adicional):

Procedeu-se com rigorosa dissecção tecidual paralela e lise de aderências complexas interentéricas e pélvicas.

Realizada a drenagem do abscesso local e restauração da anatomia pélvica, consumindo 45 minutos de tempo cirúrgico adicional.

4. Acesso Retroperitoneal e Ureterólise:

Utilizando diferentes vias de acesso anatômico, incisou-se o peritônio parietal lateral paralelamente ao ligamento infundibulopélvico.

Amplo desenvolvimento dos espaços avasculares paravesical e pararretal (espaço de Latzko).

Identificação e isolamento bilateral do ureter em sua porção pélvica e abdominal.

5. Estadiamento Linfonodal:

Pélvica: Exérese do tecido fibroadiposo e linfonodal nas regiões ilíaca externa, ilíaca interna e fossa obturadora. Limites anatômicos respeitados: nervo genitofemoral (lateral), bifurcação da artéria ilíaca comum (cranial), veia ilíaca circunflexa profunda (caudal) e nervo obturador (inferior).

Para-aórtica: Linfadenectomia estendida até a veia renal esquerda.

Nota: Material enviado para exame anatomopatológico de congelação intraoperatória (ultraestadiamento).

6. Exérese (Tempo Principal):

Na sequência topográfica, executou-se a Histerectomia Total extrafascial com Salpingo-ooforectomia Bilateral.

Ligadura seletiva dos pedículos uterinos e ovarianos.

Oclusão da cúpula vaginal com sutura farpada contínua (Fio V-Loc) para prevenção de deiscência.

7. Estadiamento Peritoneal:

Realizada omentectomia infracólica de rotina.

Múltiplas biópsias peritoneais por shaving nas goteiras parietocólicas e cúpula diafragmática.

8. Revisão e Drenagem Pélvica:

Revisão hemostática rigorosa da cavidade.

Introdução de dreno de sucção fechada (Portovac) na pelve, justificado pelo amplo descolamento retroperitoneal e linfadenectomia.

9. Fechamento e Correção de Parede Abdominal:

Durante o fechamento, identificou-se deiscência aponeurótica parcial (de cirurgia prévia) e áreas de isquemia no tecido celular subcutâneo.

Sob troca de campo estéril e por vias de acesso distintas, realizou-se a confecção de curativo de Grau II com desbridamento cortante de tecidos inviáveis.

Aplicação de tela inorgânica de polipropileno para fixação e reforço da fáscia.

10. Observações Finais:

Tempo de sala prolongado devido à alta complexidade do caso, intervenções cirúrgicas múltiplas sequenciais e uso de tecnologias específicas (OPME).`
};

export function getSurgicalTemplate(doctor?: string, surgeryType?: string): string | null {
  if (!doctor || !surgeryType) return null;
  const docUpper = doctor.toUpperCase();
  const surgUpper = surgeryType.toUpperCase();

  if (docUpper.includes('RAFAEL')) {
    if (surgUpper.includes('HISTERECTOMIA')) {
      return drRafaelTemplates.histerectomia_total;
    }
  }
  return null;
}
