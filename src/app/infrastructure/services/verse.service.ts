import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface DailyVerse {
  text: string;
  reference: string;
  version: string;
}

/**
 * Service pour récupérer le verset du jour
 * Utilise une collection de versets en français (Louis Segond)
 */
@Injectable({
  providedIn: 'root'
})
export class VerseService {
  private readonly CACHE_KEY = 'daily_verse';
  private readonly CACHE_DATE_KEY = 'daily_verse_date';

  // Collection de versets en français (Louis Segond) pour chaque jour
  private readonly VERSES: DailyVerse[] = [
    // Janvier (1-31)
    { text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", reference: "Jean 3:16", version: "Louis Segond" },
    { text: "L'Éternel est mon berger: je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles.", reference: "Psaumes 23:1-2", version: "Louis Segond" },
    { text: "Je puis tout par celui qui me fortifie.", reference: "Philippiens 4:13", version: "Louis Segond" },
    { text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", reference: "Jérémie 29:11", version: "Louis Segond" },
    { text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.", reference: "Proverbes 3:5-6", version: "Louis Segond" },
    { text: "Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu; je te fortifie, je viens à ton secours, je te soutiens de ma droite triomphante.", reference: "Ésaïe 41:10", version: "Louis Segond" },
    { text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.", reference: "Romains 8:28", version: "Louis Segond" },
    { text: "Ne t'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.", reference: "Josué 1:9", version: "Louis Segond" },
    { text: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.", reference: "Psaumes 46:1", version: "Louis Segond" },
    { text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", reference: "Matthieu 11:28", version: "Louis Segond" },
    { text: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.", reference: "Philippiens 4:6", version: "Louis Segond" },
    { text: "Fais de l'Éternel tes délices, et il te donnera ce que ton cœur désire.", reference: "Psaumes 37:4", version: "Louis Segond" },
    { text: "Si quelqu'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées; voici, toutes choses sont devenues nouvelles.", reference: "2 Corinthiens 5:17", version: "Louis Segond" },
    { text: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles; ils courent, et ne se lassent point, ils marchent, et ne se fatiguent point.", reference: "Ésaïe 40:31", version: "Louis Segond" },
    { text: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence, afin que vous discerniez quelle est la volonté de Dieu.", reference: "Romains 12:2", version: "Louis Segond" },
    { text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance.", reference: "Galates 5:22-23", version: "Louis Segond" },
    { text: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas.", reference: "Hébreux 11:1", version: "Louis Segond" },
    { text: "Mes frères, regardez comme un sujet de joie complète les diverses épreuves auxquelles vous pouvez être exposés.", reference: "Jacques 1:2", version: "Louis Segond" },
    { text: "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.", reference: "1 Pierre 5:7", version: "Louis Segond" },
    { text: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.", reference: "Psaumes 91:1", version: "Louis Segond" },
    { text: "Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.", reference: "Matthieu 6:33", version: "Louis Segond" },
    { text: "Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", reference: "Jean 14:6", version: "Louis Segond" },
    { text: "Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous.", reference: "Romains 5:8", version: "Louis Segond" },
    { text: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.", reference: "Éphésiens 2:8", version: "Louis Segond" },
    { text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", reference: "Psaumes 119:105", version: "Louis Segond" },
    { text: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.", reference: "2 Timothée 1:7", version: "Louis Segond" },
    { text: "À celui qui est ferme dans ses sentiments tu assures la paix, la paix, parce qu'il se confie en toi.", reference: "Ésaïe 26:3", version: "Louis Segond" },
    { text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.", reference: "Colossiens 3:23", version: "Louis Segond" },
    { text: "C'est ici la journée que l'Éternel a faite: qu'elle soit pour nous un sujet d'allégresse et de joie!", reference: "Psaumes 118:24", version: "Louis Segond" },
    { text: "Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres, et qu'ils glorifient votre Père qui est dans les cieux.", reference: "Matthieu 5:16", version: "Louis Segond" },
    { text: "Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.", reference: "Jean 15:5", version: "Louis Segond" },

    // Février (32-59)
    { text: "L'Éternel est ma lumière et mon salut: de qui aurais-je crainte? L'Éternel est le soutien de ma vie: de qui aurais-je peur?", reference: "Psaumes 27:1", version: "Louis Segond" },
    { text: "Soyez toujours joyeux. Priez sans cesse. Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ.", reference: "1 Thessaloniciens 5:16-18", version: "Louis Segond" },
    { text: "L'amour est patient, il est plein de bonté; l'amour n'est point envieux; l'amour ne se vante point, il ne s'enfle point d'orgueil.", reference: "1 Corinthiens 13:4", version: "Louis Segond" },
    { text: "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.", reference: "Matthieu 18:20", version: "Louis Segond" },
    { text: "Heureux ceux qui ont faim et soif de la justice, car ils seront rassasiés!", reference: "Matthieu 5:6", version: "Louis Segond" },
    { text: "Que la parole de Christ habite parmi vous abondamment; instruisez-vous et exhortez-vous les uns les autres en toute sagesse.", reference: "Colossiens 3:16", version: "Louis Segond" },
    { text: "Tu me feras connaître le sentier de la vie; il y a d'abondantes joies devant ta face, des délices éternelles à ta droite.", reference: "Psaumes 16:11", version: "Louis Segond" },
    { text: "Je t'aime, ô Éternel, ma force! L'Éternel est mon rocher, ma forteresse, mon libérateur.", reference: "Psaumes 18:1-2", version: "Louis Segond" },
    { text: "Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.", reference: "Philippiens 4:7", version: "Louis Segond" },
    { text: "L'Éternel est près de ceux qui ont le cœur brisé, et il sauve ceux qui ont l'esprit dans l'abattement.", reference: "Psaumes 34:18", version: "Louis Segond" },
    { text: "Goûtez et voyez combien l'Éternel est bon! Heureux l'homme qui cherche en lui son refuge!", reference: "Psaumes 34:8", version: "Louis Segond" },
    { text: "L'Éternel combattra pour vous; et vous, gardez le silence.", reference: "Exode 14:14", version: "Louis Segond" },
    { text: "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.", reference: "1 Jean 1:9", version: "Louis Segond" },
    { text: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira.", reference: "Psaumes 37:5", version: "Louis Segond" },
    { text: "Que personne ne méprise ta jeunesse; mais sois un modèle pour les fidèles, en parole, en conduite, en charité, en foi, en pureté.", reference: "1 Timothée 4:12", version: "Louis Segond" },
    { text: "Car l'Éternel donne la sagesse; de sa bouche sortent la connaissance et l'intelligence.", reference: "Proverbes 2:6", version: "Louis Segond" },
    { text: "Béni soit Dieu, le Père de notre Seigneur Jésus-Christ, le Père des miséricordes et le Dieu de toute consolation.", reference: "2 Corinthiens 1:3", version: "Louis Segond" },
    { text: "Fortifiez-vous et ayez du courage! Ne craignez point et ne soyez point effrayés devant eux; car l'Éternel, ton Dieu, marchera lui-même avec toi.", reference: "Deutéronome 31:6", version: "Louis Segond" },
    { text: "Voici, je me tiens à la porte, et je frappe. Si quelqu'un entend ma voix et ouvre la porte, j'entrerai chez lui, je souperai avec lui, et lui avec moi.", reference: "Apocalypse 3:20", version: "Louis Segond" },
    { text: "Mais il m'a dit: Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse.", reference: "2 Corinthiens 12:9", version: "Louis Segond" },
    { text: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s'alarme point.", reference: "Jean 14:27", version: "Louis Segond" },
    { text: "Éternel! tu me sondes et tu me connais, tu sais quand je m'assieds et quand je me lève, tu pénètres de loin ma pensée.", reference: "Psaumes 139:1-2", version: "Louis Segond" },
    { text: "Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi: ta houlette et ton bâton me rassurent.", reference: "Psaumes 23:4", version: "Louis Segond" },
    { text: "Car je suis persuadé que ni la mort ni la vie, ni les anges ni les dominations... ne pourra nous séparer de l'amour de Dieu manifesté en Jésus-Christ.", reference: "Romains 8:38-39", version: "Louis Segond" },
    { text: "Instruisez-vous les uns les autres, et exhortez-vous réciproquement, chaque jour, aussi longtemps qu'on peut dire: Aujourd'hui!", reference: "Hébreux 3:13", version: "Louis Segond" },
    { text: "Car nous sommes son ouvrage, ayant été créés en Jésus-Christ pour de bonnes œuvres, que Dieu a préparées d'avance.", reference: "Éphésiens 2:10", version: "Louis Segond" },
    { text: "Ayez en vous les sentiments qui étaient en Jésus-Christ.", reference: "Philippiens 2:5", version: "Louis Segond" },
    { text: "C'est pourquoi je te dis: Ses nombreux péchés ont été pardonnés: car elle a beaucoup aimé.", reference: "Luc 7:47", version: "Louis Segond" },

    // Mars (60-90)
    { text: "Jésus lui dit: Si tu peux!... Tout est possible à celui qui croit.", reference: "Marc 9:23", version: "Louis Segond" },
    { text: "Heureux les miséricordieux, car ils obtiendront miséricorde!", reference: "Matthieu 5:7", version: "Louis Segond" },
    { text: "Garde ton cœur plus que toute autre chose, car de lui viennent les sources de la vie.", reference: "Proverbes 4:23", version: "Louis Segond" },
    { text: "Le voleur ne vient que pour dérober, égorger et détruire; moi, je suis venu afin que les brebis aient la vie, et qu'elles soient dans l'abondance.", reference: "Jean 10:10", version: "Louis Segond" },
    { text: "L'Éternel est bon, il est un refuge au jour de la détresse; il connaît ceux qui se confient en lui.", reference: "Nahum 1:7", version: "Louis Segond" },
    { text: "Humiliez-vous donc sous la puissante main de Dieu, afin qu'il vous élève au temps convenable.", reference: "1 Pierre 5:6", version: "Louis Segond" },
    { text: "Seigneur, à qui irions-nous? Tu as les paroles de la vie éternelle.", reference: "Jean 6:68", version: "Louis Segond" },
    { text: "Bénis l'Éternel, mon âme, et n'oublie aucun de ses bienfaits!", reference: "Psaumes 103:2", version: "Louis Segond" },
    { text: "Je lève mes yeux vers les montagnes... D'où me viendra le secours? Le secours me vient de l'Éternel, qui a fait les cieux et la terre.", reference: "Psaumes 121:1-2", version: "Louis Segond" },
    { text: "Il guérit ceux qui ont le cœur brisé, et il panse leurs blessures.", reference: "Psaumes 147:3", version: "Louis Segond" },
    { text: "Celui qui habite sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant. Je dis à l'Éternel: Mon refuge et ma forteresse, mon Dieu en qui je me confie!", reference: "Psaumes 91:1-2", version: "Louis Segond" },
    { text: "Car mes pensées ne sont pas vos pensées, et vos voies ne sont pas mes voies, dit l'Éternel.", reference: "Ésaïe 55:8", version: "Louis Segond" },
    { text: "J'ai été crucifié avec Christ; et si je vis, ce n'est plus moi qui vis, c'est Christ qui vit en moi.", reference: "Galates 2:20", version: "Louis Segond" },
    { text: "Or, sans la foi il est impossible de lui être agréable; car il faut que celui qui s'approche de Dieu croie que Dieu existe.", reference: "Hébreux 11:6", version: "Louis Segond" },
    { text: "C'est en vain que vous vous levez matin, que vous vous couchez tard... Il en donne autant à ses bien-aimés pendant leur sommeil.", reference: "Psaumes 127:2", version: "Louis Segond" },
    { text: "Car là où est ton trésor, là aussi sera ton cœur.", reference: "Matthieu 6:21", version: "Louis Segond" },
    { text: "Mais sanctifiez dans vos cœurs Christ le Seigneur, étant toujours prêts à vous défendre avec douceur et respect.", reference: "1 Pierre 3:15", version: "Louis Segond" },
    { text: "L'Éternel est ma force et mon bouclier; en lui mon cœur se confie, et je suis secouru.", reference: "Psaumes 28:7", version: "Louis Segond" },
    { text: "Arrêtez, et sachez que je suis Dieu: je domine sur les nations, je domine sur la terre.", reference: "Psaumes 46:10", version: "Louis Segond" },
    { text: "C'est lui qui pardonne toutes tes iniquités, qui guérit toutes tes maladies.", reference: "Psaumes 103:3", version: "Louis Segond" },
    { text: "Marchez selon l'Esprit, et vous n'accomplirez pas les désirs de la chair.", reference: "Galates 5:16", version: "Louis Segond" },
    { text: "Invoque-moi, et je te répondrai; je t'annoncerai de grandes choses, des choses cachées, que tu ne connais pas.", reference: "Jérémie 33:3", version: "Louis Segond" },
    { text: "Mais le Seigneur est fidèle, il vous affermira et vous préservera du malin.", reference: "2 Thessaloniciens 3:3", version: "Louis Segond" },
    { text: "Je suis l'alpha et l'oméga, dit le Seigneur Dieu, celui qui est, qui était, et qui vient, le Tout-Puissant.", reference: "Apocalypse 1:8", version: "Louis Segond" },
    { text: "L'Éternel te bénira et te gardera! L'Éternel fera luire sa face sur toi, et t'accordera sa grâce!", reference: "Nombres 6:24-25", version: "Louis Segond" },
    { text: "Je puis tout par celui qui me fortifie.", reference: "Philippiens 4:13", version: "Louis Segond" },
    { text: "Ne crains point, petit troupeau; car votre Père a trouvé bon de vous donner le royaume.", reference: "Luc 12:32", version: "Louis Segond" },
    { text: "Jésus-Christ est le même hier, aujourd'hui, et éternellement.", reference: "Hébreux 13:8", version: "Louis Segond" },
    { text: "L'Éternel est lent à la colère et riche en bonté, il pardonne l'iniquité et la rébellion.", reference: "Nombres 14:18", version: "Louis Segond" },
    { text: "Je ferai de toi une grande nation, et je te bénirai; je rendrai ton nom grand, et tu seras une source de bénédiction.", reference: "Genèse 12:2", version: "Louis Segond" },
    { text: "Voici, je suis avec vous tous les jours, jusqu'à la fin du monde.", reference: "Matthieu 28:20", version: "Louis Segond" },

    // Avril (91-120)
    { text: "Tout ce que vous demanderez avec foi par la prière, vous le recevrez.", reference: "Matthieu 21:22", version: "Louis Segond" },
    { text: "Dieu résiste aux orgueilleux, mais il fait grâce aux humbles.", reference: "Jacques 4:6", version: "Louis Segond" },
    { text: "Approchez-vous de Dieu, et il s'approchera de vous.", reference: "Jacques 4:8", version: "Louis Segond" },
    { text: "Car c'est moi, l'Éternel, ton Dieu, qui fortifie ta droite, qui te dis: Ne crains rien, je viens à ton secours.", reference: "Ésaïe 41:13", version: "Louis Segond" },
    { text: "Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu!", reference: "Matthieu 5:9", version: "Louis Segond" },
    { text: "Car nous marchons par la foi et non par la vue.", reference: "2 Corinthiens 5:7", version: "Louis Segond" },
    { text: "Remets ton sort à l'Éternel, et il te soutiendra, il ne laissera jamais chanceler le juste.", reference: "Psaumes 55:22", version: "Louis Segond" },
    { text: "Le Seigneur n'est pas en retard dans l'accomplissement de sa promesse... il use de patience envers vous.", reference: "2 Pierre 3:9", version: "Louis Segond" },
    { text: "Ne vous inquiétez donc pas du lendemain; car le lendemain aura soin de lui-même.", reference: "Matthieu 6:34", version: "Louis Segond" },
    { text: "Que chacun de vous, au lieu de considérer ses propres intérêts, considère aussi ceux des autres.", reference: "Philippiens 2:4", version: "Louis Segond" },
    { text: "Dieu est amour; et celui qui demeure dans l'amour demeure en Dieu, et Dieu demeure en lui.", reference: "1 Jean 4:16", version: "Louis Segond" },
    { text: "L'Éternel est juste dans toutes ses voies, et miséricordieux dans toutes ses œuvres.", reference: "Psaumes 145:17", version: "Louis Segond" },
    { text: "Car quiconque est né de Dieu triomphe du monde; et la victoire qui triomphe du monde, c'est notre foi.", reference: "1 Jean 5:4", version: "Louis Segond" },
    { text: "Tu n'auras point d'autres dieux devant ma face.", reference: "Exode 20:3", version: "Louis Segond" },
    { text: "Si vous demeurez dans ma parole, vous êtes vraiment mes disciples; vous connaîtrez la vérité, et la vérité vous affranchira.", reference: "Jean 8:31-32", version: "Louis Segond" },
    { text: "Garde le silence devant l'Éternel, et espère en lui.", reference: "Psaumes 37:7", version: "Louis Segond" },
    { text: "Que tout ce qui respire loue l'Éternel! Louez l'Éternel!", reference: "Psaumes 150:6", version: "Louis Segond" },
    { text: "À toi, Éternel, la grandeur, la force et la magnificence, l'éternité et la gloire.", reference: "1 Chroniques 29:11", version: "Louis Segond" },
    { text: "Que le Dieu d'espérance vous remplisse de toute joie et de toute paix dans la foi.", reference: "Romains 15:13", version: "Louis Segond" },
    { text: "Heureux ceux qui ont le cœur pur, car ils verront Dieu!", reference: "Matthieu 5:8", version: "Louis Segond" },
    { text: "Et mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ.", reference: "Philippiens 4:19", version: "Louis Segond" },
    { text: "Je suis la résurrection et la vie. Celui qui croit en moi vivra, quand même il serait mort.", reference: "Jean 11:25", version: "Louis Segond" },
    { text: "Veillez donc, car vous ne savez ni le jour, ni l'heure.", reference: "Matthieu 25:13", version: "Louis Segond" },
    { text: "Écoute, Israël! l'Éternel, notre Dieu, est le seul Éternel. Tu aimeras l'Éternel, ton Dieu, de tout ton cœur.", reference: "Deutéronome 6:4-5", version: "Louis Segond" },
    { text: "La crainte de l'Éternel est le commencement de la sagesse.", reference: "Proverbes 9:10", version: "Louis Segond" },
    { text: "Celui qui écoute la parole sans la mettre en pratique est semblable à un homme qui regarde son visage naturel dans un miroir.", reference: "Jacques 1:23", version: "Louis Segond" },
    { text: "En lui nous avons la rédemption par son sang, la rémission des péchés, selon la richesse de sa grâce.", reference: "Éphésiens 1:7", version: "Louis Segond" },
    { text: "Car notre légère affliction du moment présent produit pour nous un poids éternel de gloire.", reference: "2 Corinthiens 4:17", version: "Louis Segond" },
    { text: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour.", reference: "1 Jean 4:8", version: "Louis Segond" },
    { text: "Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables.", reference: "Psaumes 139:14", version: "Louis Segond" },

    // Mai (121-151)
    { text: "La bonté de l'Éternel dure à toujours pour ceux qui le craignent.", reference: "Psaumes 103:17", version: "Louis Segond" },
    { text: "Demeurez en moi, et je demeurerai en vous.", reference: "Jean 15:4", version: "Louis Segond" },
    { text: "Soyez sobres, veillez. Votre adversaire, le diable, rôde comme un lion rugissant, cherchant qui il dévorera.", reference: "1 Pierre 5:8", version: "Louis Segond" },
    { text: "Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable.", reference: "Éphésiens 6:11", version: "Louis Segond" },
    { text: "Que le méchant abandonne sa voie, et l'homme d'iniquité ses pensées; qu'il retourne à l'Éternel, qui aura pitié de lui.", reference: "Ésaïe 55:7", version: "Louis Segond" },
    { text: "Soumettez-vous donc à Dieu; résistez au diable, et il fuira loin de vous.", reference: "Jacques 4:7", version: "Louis Segond" },
    { text: "C'est pourquoi, prenez toutes les armes de Dieu, afin de pouvoir résister dans le mauvais jour.", reference: "Éphésiens 6:13", version: "Louis Segond" },
    { text: "Et quand vous priez, ne soyez pas comme les hypocrites... Mais quand tu pries, entre dans ta chambre.", reference: "Matthieu 6:5-6", version: "Louis Segond" },
    { text: "Ayez les mêmes sentiments les uns envers les autres. N'aspirez pas à ce qui est élevé, mais laissez-vous attirer par ce qui est humble.", reference: "Romains 12:16", version: "Louis Segond" },
    { text: "Puisque nous sommes justifiés par la foi, nous avons la paix avec Dieu par notre Seigneur Jésus-Christ.", reference: "Romains 5:1", version: "Louis Segond" },
    { text: "Je suis le bon berger. Le bon berger donne sa vie pour ses brebis.", reference: "Jean 10:11", version: "Louis Segond" },
    { text: "Heureux les pauvres en esprit, car le royaume des cieux est à eux!", reference: "Matthieu 5:3", version: "Louis Segond" },
    { text: "Si quelqu'un veut venir après moi, qu'il renonce à lui-même, qu'il se charge de sa croix, et qu'il me suive.", reference: "Matthieu 16:24", version: "Louis Segond" },
    { text: "Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous.", reference: "Actes 1:8", version: "Louis Segond" },
    { text: "Car où est ton trésor, là aussi sera ton cœur.", reference: "Luc 12:34", version: "Louis Segond" },
    { text: "Comme le Père m'a aimé, je vous ai aussi aimés. Demeurez dans mon amour.", reference: "Jean 15:9", version: "Louis Segond" },
    { text: "Celui qui a le Fils a la vie; celui qui n'a pas le Fils de Dieu n'a pas la vie.", reference: "1 Jean 5:12", version: "Louis Segond" },
    { text: "Je t'instruis et te montre la voie que tu dois suivre; je te conseille, j'ai l'œil sur toi.", reference: "Psaumes 32:8", version: "Louis Segond" },
    { text: "Réjouissez-vous toujours dans le Seigneur; je le répète, réjouissez-vous.", reference: "Philippiens 4:4", version: "Louis Segond" },
    { text: "Tu aimeras ton prochain comme toi-même.", reference: "Matthieu 22:39", version: "Louis Segond" },
    { text: "C'est pourquoi, soit que vous mangiez, soit que vous buviez... faites tout pour la gloire de Dieu.", reference: "1 Corinthiens 10:31", version: "Louis Segond" },
    { text: "Eternel, Seigneur! Voici, tu as fait les cieux et la terre par ta grande puissance.", reference: "Jérémie 32:17", version: "Louis Segond" },
    { text: "Celui qui croit en moi, des fleuves d'eau vive couleront de son sein.", reference: "Jean 7:38", version: "Louis Segond" },
    { text: "Supportez-vous les uns les autres, et, si l'un a sujet de se plaindre de l'autre, pardonnez-vous réciproquement.", reference: "Colossiens 3:13", version: "Louis Segond" },
    { text: "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.", reference: "Matthieu 18:20", version: "Louis Segond" },
    { text: "Mais moi, je vous dis: Aimez vos ennemis, bénissez ceux qui vous maudissent.", reference: "Matthieu 5:44", version: "Louis Segond" },
    { text: "Enseigne-moi à faire ta volonté! Car tu es mon Dieu. Que ton bon esprit me conduise sur la voie droite!", reference: "Psaumes 143:10", version: "Louis Segond" },
    { text: "Soyez forts, et que votre cœur s'affermisse, vous tous qui espérez en l'Éternel!", reference: "Psaumes 31:24", version: "Louis Segond" },
    { text: "Que ta main soit sur l'homme de ta droite, sur le fils de l'homme que tu t'es choisi!", reference: "Psaumes 80:17", version: "Louis Segond" },
    { text: "Et maintenant que vous avez été affranchis du péché et que vous êtes devenus esclaves de Dieu.", reference: "Romains 6:22", version: "Louis Segond" },
    { text: "Jésus lui dit: Ne t'ai-je pas dit que, si tu crois, tu verras la gloire de Dieu?", reference: "Jean 11:40", version: "Louis Segond" },

    // Juin-Décembre (152-365) - Répétition avec variations et ajouts
    { text: "L'Éternel fait tout pour sa gloire, même le méchant pour le jour du malheur.", reference: "Proverbes 16:4", version: "Louis Segond" },
    { text: "Car le salaire du péché, c'est la mort; mais le don gratuit de Dieu, c'est la vie éternelle en Jésus-Christ.", reference: "Romains 6:23", version: "Louis Segond" },
    { text: "Père, je veux que là où je suis ceux que tu m'as donnés soient aussi avec moi.", reference: "Jean 17:24", version: "Louis Segond" },
    { text: "Quand les justes se multiplient, le peuple est dans la joie.", reference: "Proverbes 29:2", version: "Louis Segond" },
    { text: "Car le royaume de Dieu, ce n'est pas le manger et le boire, mais la justice, la paix et la joie, par le Saint-Esprit.", reference: "Romains 14:17", version: "Louis Segond" },
    { text: "Je vous exhorte donc, frères, par les compassions de Dieu, à offrir vos corps comme un sacrifice vivant, saint, agréable à Dieu.", reference: "Romains 12:1", version: "Louis Segond" },
    { text: "Heureux l'homme qui supporte patiemment la tentation; car, après avoir été éprouvé, il recevra la couronne de vie.", reference: "Jacques 1:12", version: "Louis Segond" },
    { text: "Car ce n'est pas contre la chair et le sang que nous avons à lutter, mais contre les dominations, contre les autorités.", reference: "Éphésiens 6:12", version: "Louis Segond" },
    { text: "C'est de lui, par lui, et pour lui que sont toutes choses. À lui la gloire dans tous les siècles! Amen!", reference: "Romains 11:36", version: "Louis Segond" },
    { text: "Béni soit le Dieu et Père de notre Seigneur Jésus-Christ, qui nous a bénis de toutes sortes de bénédictions spirituelles.", reference: "Éphésiens 1:3", version: "Louis Segond" },
    { text: "Écoutez-moi, vous qui connaissez la justice, peuple, qui as ma loi dans ton cœur!", reference: "Ésaïe 51:7", version: "Louis Segond" },
    { text: "Entrez par la porte étroite. Car large est la porte, spacieux est le chemin qui mènent à la perdition.", reference: "Matthieu 7:13", version: "Louis Segond" },
    { text: "Voici, je fais toutes choses nouvelles.", reference: "Apocalypse 21:5", version: "Louis Segond" },
    { text: "Celui qui vaincra héritera ces choses; je serai son Dieu, et il sera mon fils.", reference: "Apocalypse 21:7", version: "Louis Segond" },
    { text: "Et l'Esprit et l'épouse disent: Viens. Et que celui qui entend dise: Viens.", reference: "Apocalypse 22:17", version: "Louis Segond" }
  ];

  /**
   * Récupère le verset du jour
   * Utilise un cache local pour éviter de recalculer
   */
  getDailyVerse(): Observable<DailyVerse> {
    // Vérifier le cache
    const cachedVerse = this.getCachedVerse();
    if (cachedVerse) {
      return of(cachedVerse);
    }

    // Sélectionner un verset basé sur le jour de l'année
    const verse = this.getVerseForToday();
    this.cacheVerse(verse);

    return of(verse);
  }

  /**
   * Sélectionne un verset basé sur le jour de l'année
   */
  private getVerseForToday(): DailyVerse {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Utiliser le jour de l'année pour sélectionner un verset
    const index = dayOfYear % this.VERSES.length;
    return this.VERSES[index];
  }

  /**
   * Récupère le verset en cache s'il est encore valide (même jour)
   */
  private getCachedVerse(): DailyVerse | null {
    try {
      const cachedDate = localStorage.getItem(this.CACHE_DATE_KEY);
      const today = new Date().toDateString();

      if (cachedDate === today) {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch {
      // Ignorer les erreurs de localStorage
    }
    return null;
  }

  /**
   * Met en cache le verset du jour
   */
  private cacheVerse(verse: DailyVerse): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(verse));
      localStorage.setItem(this.CACHE_DATE_KEY, new Date().toDateString());
    } catch {
      // Ignorer les erreurs de localStorage
    }
  }

  /**
   * Force le rafraîchissement du verset (efface le cache)
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_DATE_KEY);
    } catch {
      // Ignorer les erreurs
    }
  }
}
