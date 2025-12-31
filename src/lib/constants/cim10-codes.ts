/**
 * Base de codes CIM-10 courants en ORL
 * Organisés par catégorie anatomique
 */

import type { CIM10Code } from '@/types/codage';

export const CIM10_ORL_CODES: CIM10Code[] = [
  // ============================================================================
  // OREILLE (H60-H95)
  // ============================================================================

  // Otites externes
  {
    code: 'H60.0',
    libelle: "Abcès de l'oreille externe",
    libelle_court: 'Abcès oreille ext.',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H60.3',
    libelle: 'Otite externe infectieuse',
    libelle_court: 'Otite ext. infect.',
    categorie: 'Oreille',
    frequence: 85,
  },
  {
    code: 'H60.5',
    libelle: 'Otite externe aiguë, non infectieuse',
    libelle_court: 'Otite ext. non infect.',
    categorie: 'Oreille',
    frequence: 40,
  },
  {
    code: 'H60.9',
    libelle: 'Otite externe, sans précision',
    libelle_court: 'Otite externe SAI',
    categorie: 'Oreille',
    frequence: 90,
  },
  {
    code: 'H61.0',
    libelle: "Périchondrite de l'oreille externe",
    libelle_court: 'Périchondrite',
    categorie: 'Oreille',
    frequence: 20,
  },
  {
    code: 'H61.2',
    libelle: 'Bouchon de cérumen',
    libelle_court: 'Bouchon cérumen',
    categorie: 'Oreille',
    frequence: 95,
  },

  // Otites moyennes
  {
    code: 'H65.0',
    libelle: 'Otite moyenne aiguë séreuse',
    libelle_court: 'OMA séreuse',
    categorie: 'Oreille',
    frequence: 75,
  },
  {
    code: 'H65.1',
    libelle: 'Otite moyenne aiguë et subaiguë',
    libelle_court: 'OMA subaiguë',
    categorie: 'Oreille',
    frequence: 60,
  },
  {
    code: 'H65.2',
    libelle: 'Otite moyenne séreuse chronique',
    libelle_court: 'OSM chronique',
    categorie: 'Oreille',
    frequence: 80,
  },
  {
    code: 'H65.3',
    libelle: 'Otite moyenne muqueuse chronique',
    libelle_court: 'OM muqueuse chron.',
    categorie: 'Oreille',
    frequence: 50,
  },
  {
    code: 'H65.4',
    libelle: 'Autres otites moyennes chroniques non suppurées',
    libelle_court: 'OM chron. non supp.',
    categorie: 'Oreille',
    frequence: 40,
  },
  {
    code: 'H65.9',
    libelle: 'Otite moyenne non suppurée, sans précision',
    libelle_court: 'OM non supp. SAI',
    categorie: 'Oreille',
    frequence: 70,
  },
  {
    code: 'H66.0',
    libelle: 'Otite moyenne suppurée aiguë',
    libelle_court: 'OMA suppurée',
    categorie: 'Oreille',
    frequence: 85,
  },
  {
    code: 'H66.1',
    libelle: 'Otite moyenne suppurée chronique tubotympanique',
    libelle_court: 'OM chron. tubotymp.',
    categorie: 'Oreille',
    frequence: 55,
  },
  {
    code: 'H66.2',
    libelle: 'Otite moyenne suppurée chronique attico-antrale',
    libelle_court: 'OM chron. attico-antr.',
    categorie: 'Oreille',
    frequence: 35,
  },
  {
    code: 'H66.3',
    libelle: 'Autres otites moyennes suppurées chroniques',
    libelle_court: 'OM supp. chron. autre',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H66.4',
    libelle: 'Otite moyenne suppurée, sans précision',
    libelle_court: 'OM suppurée SAI',
    categorie: 'Oreille',
    frequence: 75,
  },
  {
    code: 'H66.9',
    libelle: 'Otite moyenne, sans précision',
    libelle_court: 'Otite moyenne SAI',
    categorie: 'Oreille',
    frequence: 90,
  },
  {
    code: 'H67.0',
    libelle: 'Otite moyenne au cours de maladies bactériennes',
    libelle_court: 'OM bactérienne',
    categorie: 'Oreille',
    frequence: 25,
  },

  // Pathologie tympanique
  {
    code: 'H72.0',
    libelle: 'Perforation centrale du tympan',
    libelle_court: 'Perf. tympan centr.',
    categorie: 'Oreille',
    frequence: 65,
  },
  {
    code: 'H72.1',
    libelle: 'Perforation atticale du tympan',
    libelle_court: 'Perf. tympan attic.',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H72.2',
    libelle: 'Autres perforations marginales du tympan',
    libelle_court: 'Perf. tympan marg.',
    categorie: 'Oreille',
    frequence: 25,
  },
  {
    code: 'H72.9',
    libelle: 'Perforation du tympan, sans précision',
    libelle_court: 'Perf. tympan SAI',
    categorie: 'Oreille',
    frequence: 70,
  },
  {
    code: 'H73.0',
    libelle: 'Myringite aiguë',
    libelle_court: 'Myringite aiguë',
    categorie: 'Oreille',
    frequence: 45,
  },
  {
    code: 'H73.1',
    libelle: 'Myringite chronique',
    libelle_court: 'Myringite chronique',
    categorie: 'Oreille',
    frequence: 20,
  },
  {
    code: 'H74.0',
    libelle: 'Tympanosclérose',
    libelle_court: 'Tympanosclérose',
    categorie: 'Oreille',
    frequence: 40,
  },
  {
    code: 'H74.1',
    libelle: "Otite adhésive de l'oreille moyenne",
    libelle_court: 'Otite adhésive',
    categorie: 'Oreille',
    frequence: 25,
  },

  // Mastoïdite et cholestéatome
  {
    code: 'H70.0',
    libelle: 'Mastoïdite aiguë',
    libelle_court: 'Mastoïdite aiguë',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H70.1',
    libelle: 'Mastoïdite chronique',
    libelle_court: 'Mastoïdite chronique',
    categorie: 'Oreille',
    frequence: 25,
  },
  {
    code: 'H71',
    libelle: "Cholestéatome de l'oreille moyenne",
    libelle_court: 'Cholestéatome',
    categorie: 'Oreille',
    frequence: 45,
  },

  // Otospongiose
  {
    code: 'H80.0',
    libelle: 'Otospongiose de la fenêtre ovale, non oblitérante',
    libelle_court: 'Otospong. non oblitér.',
    categorie: 'Oreille',
    frequence: 50,
  },
  {
    code: 'H80.1',
    libelle: 'Otospongiose de la fenêtre ovale, oblitérante',
    libelle_court: 'Otospong. oblitérante',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H80.2',
    libelle: 'Otospongiose cochléaire',
    libelle_court: 'Otospong. cochléaire',
    categorie: 'Oreille',
    frequence: 25,
  },
  {
    code: 'H80.9',
    libelle: 'Otospongiose, sans précision',
    libelle_court: 'Otospongiose SAI',
    categorie: 'Oreille',
    frequence: 55,
  },

  // Vertiges et troubles vestibulaires
  {
    code: 'H81.0',
    libelle: 'Maladie de Ménière',
    libelle_court: 'Ménière',
    categorie: 'Oreille',
    frequence: 65,
  },
  {
    code: 'H81.1',
    libelle: 'Vertige paroxystique bénin',
    libelle_court: 'VPPB',
    categorie: 'Oreille',
    frequence: 90,
  },
  {
    code: 'H81.2',
    libelle: 'Névrite vestibulaire',
    libelle_court: 'Névrite vestibulaire',
    categorie: 'Oreille',
    frequence: 55,
  },
  {
    code: 'H81.3',
    libelle: 'Autres vertiges périphériques',
    libelle_court: 'Vertiges périph.',
    categorie: 'Oreille',
    frequence: 50,
  },
  {
    code: 'H81.4',
    libelle: "Vertige d'origine centrale",
    libelle_court: 'Vertige central',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H81.9',
    libelle: 'Troubles de la fonction vestibulaire, sans précision',
    libelle_court: 'Trouble vestib. SAI',
    categorie: 'Oreille',
    frequence: 60,
  },
  {
    code: 'H82',
    libelle: 'Syndromes vertigineux au cours de maladies classées ailleurs',
    libelle_court: 'Vertiges secondaires',
    categorie: 'Oreille',
    frequence: 20,
  },
  {
    code: 'H83.0',
    libelle: 'Labyrinthite',
    libelle_court: 'Labyrinthite',
    categorie: 'Oreille',
    frequence: 40,
  },
  {
    code: 'H83.2',
    libelle: 'Dysfonctionnement labyrinthique',
    libelle_court: 'Dysfct labyrinthique',
    categorie: 'Oreille',
    frequence: 35,
  },
  {
    code: 'H83.3',
    libelle: "Effets du bruit sur l'oreille interne",
    libelle_court: 'Trauma sonore',
    categorie: 'Oreille',
    frequence: 50,
  },

  // Surdité
  {
    code: 'H90.0',
    libelle: 'Surdité de transmission bilatérale',
    libelle_court: 'Surdité transm. bilat.',
    categorie: 'Oreille',
    frequence: 55,
  },
  {
    code: 'H90.1',
    libelle: 'Surdité de transmission unilatérale avec audition normale controlatérale',
    libelle_court: 'Surdité transm. unilat.',
    categorie: 'Oreille',
    frequence: 45,
  },
  {
    code: 'H90.2',
    libelle: 'Surdité de transmission, sans précision',
    libelle_court: 'Surdité transm. SAI',
    categorie: 'Oreille',
    frequence: 60,
  },
  {
    code: 'H90.3',
    libelle: 'Surdité de perception bilatérale',
    libelle_court: 'Surdité perc. bilat.',
    categorie: 'Oreille',
    frequence: 85,
  },
  {
    code: 'H90.4',
    libelle: 'Surdité de perception unilatérale avec audition normale controlatérale',
    libelle_court: 'Surdité perc. unilat.',
    categorie: 'Oreille',
    frequence: 50,
  },
  {
    code: 'H90.5',
    libelle: 'Surdité de perception, sans précision',
    libelle_court: 'Surdité perc. SAI',
    categorie: 'Oreille',
    frequence: 75,
  },
  {
    code: 'H90.6',
    libelle: 'Surdité mixte bilatérale',
    libelle_court: 'Surdité mixte bilat.',
    categorie: 'Oreille',
    frequence: 45,
  },
  {
    code: 'H90.7',
    libelle: 'Surdité mixte unilatérale',
    libelle_court: 'Surdité mixte unilat.',
    categorie: 'Oreille',
    frequence: 30,
  },
  {
    code: 'H90.8',
    libelle: 'Surdité mixte, sans précision',
    libelle_court: 'Surdité mixte SAI',
    categorie: 'Oreille',
    frequence: 40,
  },
  {
    code: 'H91.0',
    libelle: "Perte d'audition ototoxique",
    libelle_court: 'Surdité ototoxique',
    categorie: 'Oreille',
    frequence: 25,
  },
  {
    code: 'H91.1',
    libelle: 'Presbyacousie',
    libelle_court: 'Presbyacousie',
    categorie: 'Oreille',
    frequence: 90,
  },
  {
    code: 'H91.2',
    libelle: "Perte d'audition brusque idiopathique",
    libelle_court: 'Surdité brusque',
    categorie: 'Oreille',
    frequence: 60,
  },
  {
    code: 'H91.9',
    libelle: "Perte d'audition, sans précision",
    libelle_court: 'Hypoacousie SAI',
    categorie: 'Oreille',
    frequence: 70,
  },

  // Acouphènes et autres
  {
    code: 'H93.0',
    libelle: "Troubles dégénératifs et vasculaires de l'oreille",
    libelle_court: 'Troubles vasc. oreille',
    categorie: 'Oreille',
    frequence: 25,
  },
  {
    code: 'H93.1',
    libelle: 'Acouphènes',
    libelle_court: 'Acouphènes',
    categorie: 'Oreille',
    frequence: 90,
  },
  {
    code: 'H93.2',
    libelle: 'Autres perceptions auditives anormales',
    libelle_court: 'Percept. audit. anorm.',
    categorie: 'Oreille',
    frequence: 20,
  },
  {
    code: 'H93.3',
    libelle: 'Troubles du nerf auditif',
    libelle_court: 'Trouble nerf VIII',
    categorie: 'Oreille',
    frequence: 30,
  },

  // ============================================================================
  // NEZ ET SINUS (J00-J39, R04)
  // ============================================================================

  // Rhinites et rhinopharyngites
  {
    code: 'J00',
    libelle: 'Rhinopharyngite aiguë [rhume banal]',
    libelle_court: 'Rhume',
    categorie: 'Nez',
    frequence: 95,
  },
  {
    code: 'J30.0',
    libelle: 'Rhinite vasomotrice',
    libelle_court: 'Rhinite vasomotrice',
    categorie: 'Nez',
    frequence: 50,
  },
  {
    code: 'J30.1',
    libelle: 'Rhinite allergique due au pollen',
    libelle_court: 'Rhinite pollen',
    categorie: 'Nez',
    frequence: 85,
  },
  {
    code: 'J30.2',
    libelle: 'Autres rhinites allergiques saisonnières',
    libelle_court: 'Rhinite saisonn.',
    categorie: 'Nez',
    frequence: 55,
  },
  {
    code: 'J30.3',
    libelle: 'Autres rhinites allergiques',
    libelle_court: 'Rhinite allerg. autre',
    categorie: 'Nez',
    frequence: 60,
  },
  {
    code: 'J30.4',
    libelle: 'Rhinite allergique, sans précision',
    libelle_court: 'Rhinite allerg. SAI',
    categorie: 'Nez',
    frequence: 80,
  },
  {
    code: 'J31.0',
    libelle: 'Rhinite chronique',
    libelle_court: 'Rhinite chronique',
    categorie: 'Nez',
    frequence: 70,
  },
  {
    code: 'J31.1',
    libelle: 'Rhinopharyngite chronique',
    libelle_court: 'Rhinopharyngite chron.',
    categorie: 'Nez',
    frequence: 45,
  },
  {
    code: 'J31.2',
    libelle: 'Pharyngite chronique',
    libelle_court: 'Pharyngite chronique',
    categorie: 'Nez',
    frequence: 50,
  },

  // Sinusites
  {
    code: 'J01.0',
    libelle: 'Sinusite maxillaire aiguë',
    libelle_court: 'Sinusite max. aiguë',
    categorie: 'Nez',
    frequence: 90,
  },
  {
    code: 'J01.1',
    libelle: 'Sinusite frontale aiguë',
    libelle_court: 'Sinusite front. aiguë',
    categorie: 'Nez',
    frequence: 55,
  },
  {
    code: 'J01.2',
    libelle: 'Sinusite ethmoïdale aiguë',
    libelle_court: 'Sinusite ethm. aiguë',
    categorie: 'Nez',
    frequence: 40,
  },
  {
    code: 'J01.3',
    libelle: 'Sinusite sphénoïdale aiguë',
    libelle_court: 'Sinusite sphén. aiguë',
    categorie: 'Nez',
    frequence: 25,
  },
  {
    code: 'J01.4',
    libelle: 'Pansinusite aiguë',
    libelle_court: 'Pansinusite aiguë',
    categorie: 'Nez',
    frequence: 35,
  },
  {
    code: 'J01.9',
    libelle: 'Sinusite aiguë, sans précision',
    libelle_court: 'Sinusite aiguë SAI',
    categorie: 'Nez',
    frequence: 85,
  },
  {
    code: 'J32.0',
    libelle: 'Sinusite maxillaire chronique',
    libelle_court: 'Sinusite max. chron.',
    categorie: 'Nez',
    frequence: 75,
  },
  {
    code: 'J32.1',
    libelle: 'Sinusite frontale chronique',
    libelle_court: 'Sinusite front. chron.',
    categorie: 'Nez',
    frequence: 40,
  },
  {
    code: 'J32.2',
    libelle: 'Sinusite ethmoïdale chronique',
    libelle_court: 'Sinusite ethm. chron.',
    categorie: 'Nez',
    frequence: 45,
  },
  {
    code: 'J32.3',
    libelle: 'Sinusite sphénoïdale chronique',
    libelle_court: 'Sinusite sphén. chron.',
    categorie: 'Nez',
    frequence: 20,
  },
  {
    code: 'J32.4',
    libelle: 'Pansinusite chronique',
    libelle_court: 'Pansinusite chron.',
    categorie: 'Nez',
    frequence: 30,
  },
  {
    code: 'J32.9',
    libelle: 'Sinusite chronique, sans précision',
    libelle_court: 'Sinusite chron. SAI',
    categorie: 'Nez',
    frequence: 70,
  },

  // Polypes et déviations
  {
    code: 'J33.0',
    libelle: 'Polype des fosses nasales',
    libelle_court: 'Polype nasal',
    categorie: 'Nez',
    frequence: 65,
  },
  {
    code: 'J33.1',
    libelle: 'Dégénérescence polypoïde du sinus',
    libelle_court: 'Polypose sinusienne',
    categorie: 'Nez',
    frequence: 55,
  },
  {
    code: 'J33.8',
    libelle: 'Autres polypes des sinus',
    libelle_court: 'Polype sinus autre',
    categorie: 'Nez',
    frequence: 30,
  },
  {
    code: 'J33.9',
    libelle: 'Polype nasal, sans précision',
    libelle_court: 'Polype nasal SAI',
    categorie: 'Nez',
    frequence: 60,
  },
  {
    code: 'J34.0',
    libelle: 'Abcès, furoncle et anthrax du nez',
    libelle_court: 'Abcès nez',
    categorie: 'Nez',
    frequence: 25,
  },
  {
    code: 'J34.1',
    libelle: 'Kyste ou mucocèle du nez et du sinus',
    libelle_court: 'Kyste sinus',
    categorie: 'Nez',
    frequence: 35,
  },
  {
    code: 'J34.2',
    libelle: 'Déviation de la cloison nasale',
    libelle_court: 'Déviation cloison',
    categorie: 'Nez',
    frequence: 80,
  },
  {
    code: 'J34.3',
    libelle: 'Hypertrophie des cornets',
    libelle_court: 'Hypertrophie cornets',
    categorie: 'Nez',
    frequence: 70,
  },
  {
    code: 'J34.8',
    libelle: 'Autres troubles du nez et des sinus',
    libelle_court: 'Trouble nez autre',
    categorie: 'Nez',
    frequence: 40,
  },

  // Épistaxis
  {
    code: 'R04.0',
    libelle: 'Épistaxis',
    libelle_court: 'Épistaxis',
    categorie: 'Nez',
    frequence: 85,
  },

  // ============================================================================
  // GORGE ET PHARYNX (J02-J06, J35-J39, R49)
  // ============================================================================

  // Pharyngites et angines
  {
    code: 'J02.0',
    libelle: 'Pharyngite streptococcique',
    libelle_court: 'Angine strepto',
    categorie: 'Gorge',
    frequence: 75,
  },
  {
    code: 'J02.8',
    libelle: "Pharyngite aiguë due à d'autres micro-organismes",
    libelle_court: 'Pharyngite autre',
    categorie: 'Gorge',
    frequence: 45,
  },
  {
    code: 'J02.9',
    libelle: 'Pharyngite aiguë, sans précision',
    libelle_court: 'Pharyngite aiguë SAI',
    categorie: 'Gorge',
    frequence: 85,
  },
  {
    code: 'J03.0',
    libelle: 'Amygdalite streptococcique',
    libelle_court: 'Amygdalite strepto',
    categorie: 'Gorge',
    frequence: 70,
  },
  {
    code: 'J03.8',
    libelle: "Amygdalite aiguë due à d'autres micro-organismes",
    libelle_court: 'Amygdalite autre',
    categorie: 'Gorge',
    frequence: 40,
  },
  {
    code: 'J03.9',
    libelle: 'Amygdalite aiguë, sans précision',
    libelle_court: 'Amygdalite aiguë SAI',
    categorie: 'Gorge',
    frequence: 80,
  },
  {
    code: 'J04.0',
    libelle: 'Laryngite aiguë',
    libelle_court: 'Laryngite aiguë',
    categorie: 'Gorge',
    frequence: 75,
  },
  {
    code: 'J04.1',
    libelle: 'Trachéite aiguë',
    libelle_court: 'Trachéite aiguë',
    categorie: 'Gorge',
    frequence: 50,
  },
  {
    code: 'J04.2',
    libelle: 'Laryngo-trachéite aiguë',
    libelle_court: 'Laryngo-trachéite',
    categorie: 'Gorge',
    frequence: 55,
  },
  {
    code: 'J05.0',
    libelle: 'Laryngite obstructive aiguë [croup]',
    libelle_court: 'Croup',
    categorie: 'Gorge',
    frequence: 35,
  },
  {
    code: 'J05.1',
    libelle: 'Épiglottite aiguë',
    libelle_court: 'Épiglottite',
    categorie: 'Gorge',
    frequence: 25,
  },
  {
    code: 'J06.0',
    libelle: 'Laryngopharyngite aiguë',
    libelle_court: 'Laryngopharyngite',
    categorie: 'Gorge',
    frequence: 45,
  },
  {
    code: 'J06.9',
    libelle: 'Infection aiguë des voies respiratoires supérieures, sans précision',
    libelle_court: 'IVRS aiguë SAI',
    categorie: 'Gorge',
    frequence: 90,
  },

  // Amygdales et végétations
  {
    code: 'J35.0',
    libelle: 'Amygdalite chronique',
    libelle_court: 'Amygdalite chronique',
    categorie: 'Gorge',
    frequence: 65,
  },
  {
    code: 'J35.1',
    libelle: 'Hypertrophie des amygdales',
    libelle_court: 'Hypertrophie amygdales',
    categorie: 'Gorge',
    frequence: 70,
  },
  {
    code: 'J35.2',
    libelle: 'Hypertrophie des végétations adénoïdes',
    libelle_court: 'Hypertrophie végétations',
    categorie: 'Gorge',
    frequence: 65,
  },
  {
    code: 'J35.3',
    libelle: 'Hypertrophie des amygdales avec hypertrophie des végétations',
    libelle_court: 'Hypertrophie amygdales+végét.',
    categorie: 'Gorge',
    frequence: 55,
  },
  {
    code: 'J35.8',
    libelle: 'Autres maladies chroniques des amygdales et des végétations',
    libelle_court: 'Maladie amygdales autre',
    categorie: 'Gorge',
    frequence: 30,
  },
  {
    code: 'J35.9',
    libelle: 'Maladie chronique des amygdales et des végétations, sans précision',
    libelle_court: 'Maladie amygdales SAI',
    categorie: 'Gorge',
    frequence: 45,
  },
  {
    code: 'J36',
    libelle: 'Abcès périamygdalien',
    libelle_court: 'Phlegmon amygdalien',
    categorie: 'Gorge',
    frequence: 40,
  },

  // Larynx
  {
    code: 'J37.0',
    libelle: 'Laryngite chronique',
    libelle_court: 'Laryngite chronique',
    categorie: 'Gorge',
    frequence: 50,
  },
  {
    code: 'J37.1',
    libelle: 'Laryngo-trachéite chronique',
    libelle_court: 'Laryngo-trachéite chron.',
    categorie: 'Gorge',
    frequence: 30,
  },
  {
    code: 'J38.0',
    libelle: 'Paralysie des cordes vocales et du larynx',
    libelle_court: 'Paralysie corde vocale',
    categorie: 'Gorge',
    frequence: 45,
  },
  {
    code: 'J38.1',
    libelle: 'Polype des cordes vocales et du larynx',
    libelle_court: 'Polype corde vocale',
    categorie: 'Gorge',
    frequence: 50,
  },
  {
    code: 'J38.2',
    libelle: 'Nodules des cordes vocales',
    libelle_court: 'Nodules cordes vocales',
    categorie: 'Gorge',
    frequence: 55,
  },
  {
    code: 'J38.3',
    libelle: 'Autres maladies des cordes vocales',
    libelle_court: 'Maladie corde vocale autre',
    categorie: 'Gorge',
    frequence: 35,
  },
  {
    code: 'J38.4',
    libelle: 'Œdème du larynx',
    libelle_court: 'Œdème larynx',
    categorie: 'Gorge',
    frequence: 30,
  },
  {
    code: 'J38.5',
    libelle: 'Spasme laryngé',
    libelle_court: 'Laryngospasme',
    categorie: 'Gorge',
    frequence: 25,
  },
  {
    code: 'J38.6',
    libelle: 'Sténose du larynx',
    libelle_court: 'Sténose larynx',
    categorie: 'Gorge',
    frequence: 20,
  },
  {
    code: 'J38.7',
    libelle: 'Autres maladies du larynx',
    libelle_court: 'Maladie larynx autre',
    categorie: 'Gorge',
    frequence: 30,
  },

  // Dysphonie
  {
    code: 'R49.0',
    libelle: 'Dysphonie',
    libelle_court: 'Dysphonie',
    categorie: 'Gorge',
    frequence: 75,
  },
  {
    code: 'R49.1',
    libelle: 'Aphonie',
    libelle_court: 'Aphonie',
    categorie: 'Gorge',
    frequence: 35,
  },
  {
    code: 'R49.2',
    libelle: 'Rhinolalie et nasonnement',
    libelle_court: 'Rhinolalie',
    categorie: 'Gorge',
    frequence: 20,
  },

  // ============================================================================
  // COU ET CERVICO-FACIAL
  // ============================================================================

  // Glandes salivaires
  {
    code: 'K11.0',
    libelle: 'Atrophie de glande salivaire',
    libelle_court: 'Atrophie glande saliv.',
    categorie: 'Cou',
    frequence: 15,
  },
  {
    code: 'K11.1',
    libelle: 'Hypertrophie de glande salivaire',
    libelle_court: 'Hypertrophie glande saliv.',
    categorie: 'Cou',
    frequence: 20,
  },
  {
    code: 'K11.2',
    libelle: 'Sialadénite',
    libelle_court: 'Sialadénite',
    categorie: 'Cou',
    frequence: 40,
  },
  {
    code: 'K11.3',
    libelle: 'Abcès de glande salivaire',
    libelle_court: 'Abcès glande saliv.',
    categorie: 'Cou',
    frequence: 25,
  },
  {
    code: 'K11.5',
    libelle: 'Sialolithiase',
    libelle_court: 'Lithiase salivaire',
    categorie: 'Cou',
    frequence: 45,
  },
  {
    code: 'K11.6',
    libelle: 'Mucocèle de glande salivaire',
    libelle_court: 'Mucocèle salivaire',
    categorie: 'Cou',
    frequence: 30,
  },
  {
    code: 'K11.7',
    libelle: 'Troubles de la sécrétion salivaire',
    libelle_court: 'Trouble sécrétion saliv.',
    categorie: 'Cou',
    frequence: 35,
  },

  // Adénopathies et masses cervicales
  {
    code: 'R59.0',
    libelle: 'Adénopathie localisée',
    libelle_court: 'Adénopathie localisée',
    categorie: 'Cou',
    frequence: 65,
  },
  {
    code: 'R59.1',
    libelle: 'Adénopathie généralisée',
    libelle_court: 'Adénopathie généralisée',
    categorie: 'Cou',
    frequence: 30,
  },
  {
    code: 'R59.9',
    libelle: 'Adénopathie, sans précision',
    libelle_court: 'Adénopathie SAI',
    categorie: 'Cou',
    frequence: 55,
  },
  {
    code: 'R22.1',
    libelle: 'Tuméfaction localisée au cou',
    libelle_court: 'Masse cervicale',
    categorie: 'Cou',
    frequence: 50,
  },

  // Thyroïde (fréquent en ORL)
  {
    code: 'E04.0',
    libelle: 'Goitre non toxique diffus',
    libelle_court: 'Goitre diffus',
    categorie: 'Cou',
    frequence: 40,
  },
  {
    code: 'E04.1',
    libelle: 'Nodule thyroïdien non toxique unique',
    libelle_court: 'Nodule thyroïdien unique',
    categorie: 'Cou',
    frequence: 55,
  },
  {
    code: 'E04.2',
    libelle: 'Goitre multinodulaire non toxique',
    libelle_court: 'Goitre multinodulaire',
    categorie: 'Cou',
    frequence: 45,
  },
  {
    code: 'E04.9',
    libelle: 'Goitre non toxique, sans précision',
    libelle_court: 'Goitre SAI',
    categorie: 'Cou',
    frequence: 50,
  },
  {
    code: 'E06.0',
    libelle: 'Thyroïdite aiguë',
    libelle_court: 'Thyroïdite aiguë',
    categorie: 'Cou',
    frequence: 20,
  },
  {
    code: 'E06.1',
    libelle: 'Thyroïdite subaiguë',
    libelle_court: 'Thyroïdite subaiguë',
    categorie: 'Cou',
    frequence: 25,
  },
  {
    code: 'E06.3',
    libelle: 'Thyroïdite auto-immune',
    libelle_court: 'Thyroïdite Hashimoto',
    categorie: 'Cou',
    frequence: 35,
  },

  // Kystes congénitaux
  {
    code: 'Q18.0',
    libelle: 'Fistule du sinus, de la fossette et du kyste branchial',
    libelle_court: 'Kyste branchial',
    categorie: 'Cou',
    frequence: 30,
  },
  {
    code: 'Q89.2',
    libelle: 'Kyste du tractus thyréoglosse',
    libelle_court: 'Kyste thyréoglosse',
    categorie: 'Cou',
    frequence: 35,
  },

  // ============================================================================
  // GÉNÉRAL ET SYMPTÔMES
  // ============================================================================

  { code: 'R05', libelle: 'Toux', libelle_court: 'Toux', categorie: 'Général', frequence: 80 },
  {
    code: 'R06.0',
    libelle: 'Dyspnée',
    libelle_court: 'Dyspnée',
    categorie: 'Général',
    frequence: 45,
  },
  {
    code: 'R06.1',
    libelle: 'Stridor',
    libelle_court: 'Stridor',
    categorie: 'Général',
    frequence: 25,
  },
  {
    code: 'R06.5',
    libelle: 'Respiration buccale',
    libelle_court: 'Respiration buccale',
    categorie: 'Général',
    frequence: 55,
  },
  {
    code: 'R06.7',
    libelle: 'Éternuement',
    libelle_court: 'Éternuement',
    categorie: 'Général',
    frequence: 30,
  },
  {
    code: 'R07.0',
    libelle: 'Douleur pharyngée',
    libelle_court: 'Douleur pharynx',
    categorie: 'Général',
    frequence: 70,
  },
  {
    code: 'R09.3',
    libelle: 'Crachats anormaux',
    libelle_court: 'Crachats anormaux',
    categorie: 'Général',
    frequence: 35,
  },
  {
    code: 'R13',
    libelle: 'Dysphagie',
    libelle_court: 'Dysphagie',
    categorie: 'Général',
    frequence: 50,
  },
  {
    code: 'R21',
    libelle: 'Rash et autres éruptions cutanées non spécifiques',
    libelle_court: 'Rash cutané',
    categorie: 'Général',
    frequence: 25,
  },
  {
    code: 'R42',
    libelle: 'Étourdissement et éblouissement',
    libelle_court: 'Étourdissement',
    categorie: 'Général',
    frequence: 55,
  },
  {
    code: 'R43.0',
    libelle: 'Anosmie',
    libelle_court: 'Anosmie',
    categorie: 'Général',
    frequence: 45,
  },
  {
    code: 'R43.1',
    libelle: 'Parosmie',
    libelle_court: 'Parosmie',
    categorie: 'Général',
    frequence: 20,
  },
  {
    code: 'R43.2',
    libelle: 'Paragueusie',
    libelle_court: 'Paragueusie',
    categorie: 'Général',
    frequence: 15,
  },
  {
    code: 'R51',
    libelle: 'Céphalée',
    libelle_court: 'Céphalée',
    categorie: 'Général',
    frequence: 60,
  },
  {
    code: 'R68.2',
    libelle: 'Bouche sèche, sans précision',
    libelle_court: 'Bouche sèche',
    categorie: 'Général',
    frequence: 40,
  },

  // Apnée du sommeil
  {
    code: 'G47.3',
    libelle: 'Apnée du sommeil',
    libelle_court: 'Apnée du sommeil',
    categorie: 'Général',
    frequence: 70,
  },
  {
    code: 'R06.83',
    libelle: 'Ronflement',
    libelle_court: 'Ronflement',
    categorie: 'Général',
    frequence: 65,
  },
];

export function searchCIM10Codes(query: string, limit = 20, categorie?: string): CIM10Code[] {
  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let filtered = CIM10_ORL_CODES.filter((code) => {
    const normalizedCode = code.code.toLowerCase();
    const normalizedLibelle = code.libelle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const normalizedLibelleCourt = code.libelle_court
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return (
      normalizedCode.includes(normalizedQuery) ||
      normalizedLibelle.includes(normalizedQuery) ||
      normalizedLibelleCourt.includes(normalizedQuery)
    );
  });

  if (categorie) {
    filtered = filtered.filter((code) => code.categorie === categorie);
  }

  filtered.sort((a, b) => (b.frequence ?? 0) - (a.frequence ?? 0));

  return filtered.slice(0, limit);
}

export function getCIM10ByCode(code: string): CIM10Code | undefined {
  return CIM10_ORL_CODES.find((c) => c.code === code);
}

export function getAllCategories(): string[] {
  return [...new Set(CIM10_ORL_CODES.map((c) => c.categorie))];
}
