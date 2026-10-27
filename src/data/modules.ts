import { Compass, MessagesSquare, ShieldCheck, Scale, Heart, BatteryLow, Users, Sparkle } from 'lucide-react';
import type { ModuleId } from '@/types';

export type TheoryCard = {
  title: string;
  body: string;
  example?: string;
};

export type ModuleMeta = {
  id: ModuleId;
  title: string;
  subtitle: string;
  emoji: string;
  Icon: typeof Compass;
  accent: string;
  cards: TheoryCard[];
};

export const MODULES: ModuleMeta[] = [
  {
    id: 'life_areas',
    title: 'Livsområden & nuläge',
    subtitle: 'Kartlägg var du står idag',
    emoji: '🧭',
    Icon: Compass,
    accent: 'text-sage-300',
    cards: [
      {
        title: 'Vad innebär egenmakt i praktiken?',
        body: 'Egenmakt handlar om att flytta fokus från yttre omständigheter till inre handlingskraft. Du kan inte kontrollera allt som händer — men du kan kontrollera hur du svarar, vilka val du gör och var du lägger din energi.',
        example: 'När en arbetskamrat säger något irriterande kan du inte ta tillbaka deras ord, men du väljer om du bär med dig dem resten av dagen eller släpper dem direkt.',
      },
      {
        title: 'Livshjulet — dina viktigaste arenor',
        body: 'Livshjulet är en modell som delar in ditt liv i de arenor som oftast styr hur du mår: relationer, hälsa, ekonomi, vardagsstruktur och personlig utveckling. Genom att betygsätta varje arena syns både din balans och var störst utrymme finns för förändring.',
        example: 'En person kan ha hög hälsa (8/10) men låg vardagsstruktur (3/10) — då vet de var nästa steg har störst genomslag.',
      },
    ],
  },
  {
    id: 'self_talk',
    title: 'Självkänslomönster & inre dialog',
    subtitle: 'Omvandla kritik till stöttande råd',
    emoji: '🪞',
    Icon: MessagesSquare,
    accent: 'text-amber-300/90',
    cards: [
      {
        title: 'Automatiska tankar stjäl energi',
        body: 'Tankar som "jag duger inte", "jag borde klara det här bättre" eller "alltid misslyckas jag" är automatiserade mönster. Prestationsbaserad självkänsla — där ditt värde kopplas till vad du presterar — skapar passivitet: du undviker, drar dig undan eller överanstränger dig för att bevisa ditt värde.',
        example: 'Du skjuter upp en uppgift inte för att du är lat, utan för att den aktiverar tanken "jag kommer göra fel". Undvikandet skyddar dig tillfälligt — och kostar energi i längden.',
      },
      {
        title: 'Den inre kritikern vs den inre mentorn',
        body: 'Den inre kritikern är sträng, absolut och talar i "alltid/aldrig". Den inre mentorn är nyfiken, specifik och välvillig — den frågar "vad behöver jag här?" istället för att döma. Att omformulera självkritiska budskap till realistiska, stöttande råd är en tränbar färdighet, inte en medfödd egenskap.',
        example: 'Kritik: "Jag är hopplös på att säga nej." Mentor: "Det har varit svårt för mig att säga nej hittills. Nästa gång kan jag prova att be om betänketid innan jag svarar."',
      },
    ],
  },
  {
    id: 'expectations',
    title: 'Förväntningar & gränssättning',
    subtitle: 'Skilj dina värderingar från andras krav',
    emoji: '🛡️',
    Icon: ShieldCheck,
    accent: 'text-teal-300/90',
    cards: [
      {
        title: 'Egna värderingar vs andras förväntningar',
        body: 'Många val vi gör drivs inte av vad vi själva värderar — utan av vad familj, omgivning eller samhälle förväntar sig. När gränsen mellan "jag vill" och "jag borde" suddas ut, tappar vi kontakten med vår egen röst. Egenmakt börjar med att skilja dessa åt och välja medvetet.',
        example: 'Du tackar ja till en middag du inte orkar, för att "man ska visa sig". Ett värderingsstyrt val hade varit att stanna hemma och vila — utan skuld.',
      },
      {
        title: 'Ett vänligt nej är ett ja till dig själv',
        body: 'Att säga nej utan skuld handlar inte om att stänga ute andra — det handlar om att värna det som gör att du kan ge när det verkligen spelar roll. Ett bra nej är tydligt, kort och behöver inte förklaras i detalj. Du får ändra dig, be om betänketid och välja vad du ger ditt ja till.',
        example: '"Tack för att du frågar — just nu har jag inte utrymme för det." Inget överdrivet, ingen ursäkt, ingen förklaring som bjuder in till förhandling.',
      },
    ],
  },
  {
    id: 'change_process',
    title: 'Förändringsprocessen & beslutsbalansen',
    subtitle: 'Förstå varför du tvekar — och ta nästa steg',
    emoji: '⚖️',
    Icon: Scale,
    accent: 'text-indigo-300/80',
    cards: [
      {
        title: 'Ambivalens — att vilja och tveka samtidigt',
        body: 'Ambivalens är inte svaghet. Det är en normal del av varje förändring: en del av dig vill framåt, en annan del vill behålla det bekanta. Ju tydligare du ser båda sidorna, desto lättare är det att välja medvetet — istället för att fastna i skam över att du "inte kommit längre".',
        example: 'Du vill börja träna, men kvällarna känns trygga på soffan. Båda är sanna. Ambivalensen är inte felet — den är information om vad du värderar.',
      },
      {
        title: 'Mikrostegens kraft',
        body: 'Stora förändringar byggs sällan av stora beslut. De byggs av små, upprepningsbara handlingar som är tillräckligt små för att genomföras även på en dålig dag. Ett mikrosteg är konkret, tar under tio minuter och kräver ingen inspiration — bara ett litet val.',
        example: 'Istället för "jag ska meditera 30 min varje morgon" börjar du med "två djupa andetag innan jag öppnar telefonen". Det lilla steget genomför du också när motivationen tryter.',
      },
    ],
  },
  {
    id: 'values_clarification',
    title: 'Värderingar & val',
    subtitle: 'Lär känna vad som egentligen driver dig',
    emoji: '💎',
    Icon: Sparkle,
    accent: 'text-cyan-300/80',
    cards: [
      {
        title: 'Värderingar är kompassen, inte målet',
        body: 'Värderingar är inte regler du måste följa — de är riktningar du vill röra dig i. Till skillnad från mål som kan uppnås och avbockas är värderingar en kompass som alltid pekar framåt. När du vet vad du står för blir valen tydligare, även när de är svåra.',
        example: 'Om en av dina värderingar är "ärlighet" betyder det inte att du alltid är ärlig — utan att ärlighet är den riktning du strävar mot och kan mäta dina val mot.',
      },
      {
        title: 'Värderingskonflikt — när två riktningar drar åt olika håll',
        body: 'Många svåra val handlar inte om rätt eller fel, utan om två värderingar som krockar. Att se konflikten tydligt hjälper dig att välja medvetet istället för att känna skuld över att du "inte vet vad du vill". Du vet — det är bara två goda saker som inte ryms samtidigt.',
        example: 'Du värderar både "närhet med familjen" och "karriärintresse". Att jobba kväll är inte fel — det är ett val som prioriterar en värdering just nu. Att se det minskar skammen.',
      },
    ],
  },
  {
    id: 'stress_recovery',
    title: 'Stress & återhämtning',
    subtitle: 'Förstå din energibalans',
    emoji: '🔋',
    Icon: BatteryLow,
    accent: 'text-emerald-300/80',
    cards: [
      {
        title: 'Stress är inte fienden — bristen på återhämtning är det',
        body: 'Stress i sig är en naturlig reaktion som hjälper dig hantera krav. Problemet uppstår när stressen aldrig avlöses av återhämtning. Kroppen behöver växling — mellan ansträngning och vila, mellan aktivitet och stillhet. Utan denna rytm byggs spänningar upp tills de visas som utmattning, irritabilitet eller sömnproblem.',
        example: 'En arbetsdag med högt tempo är inte skadlig om den följs av en kväll med verklig nedvarvning. Det är när nedvarvningen uteblir dag efter dag som kroppen tappar balans.',
      },
      {
        title: 'Återhämtning är inte samma som att göra ingenting',
        body: 'Efterträdande återhämtning — aktiviteter som fyller på din energi istället för att tömma den — är mer effektivt än passiv vila. Det kan vara en promenad, ett samtal med en vän, ett kreativt intresse eller att laga mat. Nyckeln är att det ger dig energi, inte bara tar tid.',
        example: 'Att scrolla sociala medier i en timme tar tid men tömmer energi. Att ta en 20-minuters promenad utan telefon tar mindre tid men fyller på. Kvaliteten på återhämtningen spelar större roll än kvantiteten.',
      },
    ],
  },
  {
    id: 'relationship_boundaries',
    title: 'Relationer & gränser',
    subtitle: 'Bygg sundare kontakter med tydlighet',
    emoji: '🤝',
    Icon: Users,
    accent: 'text-blue-300/80',
    cards: [
      {
        title: 'Gränser är inte murar — de är instruktioner',
        body: 'En gräns handlar inte om att stänga ute människor. Den handlar om att tala om vad du behöver för att kunna vara i relationen. Tydliga gränser skapar trygghet för båda parter — det som händer i tystnad skapar ofta mer avstånd än det som sägs högt.',
        example: '"Jag behöver en timme för mig själv när jag kommer hem innan vi pratar om dagen" är en gräns som skyddar relationen, inte avvisar den andra personen.',
      },
      {
        title: 'Otydliga gränser kostar mer än tydliga',
        body: 'Att undvika att sätta en gräns för att du inte vill såra den andra personen är förståeligt — men det leder ofta till att du istället drar dig undan, blir passiv eller byggs upp frustration. Kostnaden för otydlighet betalas i form av avstånd och ressentiment, medan en tydlig gräns kan skapa en kort obekvämlighet som senare leder till större närhet.',
        example: 'Du tackar ja till att hjälpa till trots att du inte orkar, och blir sen tyst och irriterad. Den andra personen märker avståndet utan att förstå varför. Ett tidigt "jag kan inte den här veckan" hade varit mindre kostsamt.',
      },
    ],
  },
  {
    id: 'self_compassion',
    title: 'Självmedkänsla',
    subtitle: 'Möt dig själv med den värme du ger andra',
    emoji: '💛',
    Icon: Heart,
    accent: 'text-rose-300/80',
    cards: [
      {
        title: 'Självkritik motiverar inte — den lamslår',
        body: 'Många tror att hård självkritik är vad som driver dem framåt. Forskning visar det motsatta: självkritik aktiverar hotsystemet i hjärnan, vilket leder till undvikande, skam och passivitet. Självmedkänsla — att möta sina svårigheter med samma värme du skulle ge en vän — skapar i stället trygghet nog att våga försöka igen.',
        example: 'Efter ett misslyckande säger den inre kritikern "typiskt dig, du får aldrig något bra till". Självmedkänslan säger "det här var jobbigt och det är okej att känna besvikelse. Vad kan jag lära mig av det här?"',
      },
      {
        title: 'Tre delar av självmedkänsla',
        body: 'Självmedkänsla består av tre delar: vänlighet mot sig själv i stället för hårda omdömen, insikten att lidande är en del av den mänskliga erfarenheten — du är inte ensam om att känna så här — och mindful närvaro: att se dina känslor klart utan att drunkna i dem eller förneka dem.',
        example: 'När du gör ett misstag: "Det här gör ont" (mindfulness). "Andra gör också misstag — jag är inte ensam om att ha svårt här" (mänsklighet). "Det är okej att jag kämpar just nu" (vänlighet).',
      },
    ],
  },
];
