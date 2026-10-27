export type Quote = { text: string; author: string };

export const QUOTES: Quote[] = [
  { text: 'Du har makt över ditt sinne — inte över yttre händelser. Inse detta, och du hittar styrka.', author: 'Marcus Aurelius' },
  { text: 'Mellan stimulans och respons finns ett utrymme. I det utrymmet ligger vår frihet att välja.', author: 'Viktor Frankl' },
  { text: 'Fokusera på det du kan kontrollera. Släpp det du inte kan.', author: 'Epiktetos' },
  { text: 'Den som har varför att leva för kan uthärda nästan vilket hur som helst.', author: 'Friedrich Nietzsche' },
  { text: 'Ingen kan få dig att känna dig underlägsen utan ditt samtycke.', author: 'Eleanor Roosevelt' },
  { text: 'Förändring kommer inte av att vi väntar på den, utan av att vi tar ansvar för våra egna val.', author: 'Okänd' },
  { text: 'Att släppa taget är inte att ge upp. Det är att välja sin strid.', author: 'Okänd' },
  { text: 'Du behöver inte veta hela vägen. Du behöver bara ta nästa steg.', author: 'Okänd' },
  { text: 'Självbestämmande börjar där du slutar låta andras åsikter styra dina val.', author: 'Okänd' },
  { text: 'Egenmakt är inte att ha koll på allt. Det är att veta vad som är ditt att bära.', author: 'Okänd' },
  { text: 'Varje litet val är en röst för den du vill bli.', author: 'James Clear' },
  { text: 'Gränser är den vänligaste formen av ärlighet.', author: 'Brené Brown' },
  { text: 'Du kan inte hejda vågorna, men du kan lära dig surfa.', author: 'Jon Kabat-Zinn' },
  { text: 'Det är inte berget framför dig som täcker utsikten — det är kornet i ditt öga.', author: 'Okänd' },
];

export function quoteOfDay(dateKey: string): Quote {
  // Deterministic from date so it stays stable through the day.
  let sum = 0;
  for (let i = 0; i < dateKey.length; i++) sum += dateKey.charCodeAt(i);
  return QUOTES[sum % QUOTES.length];
}
