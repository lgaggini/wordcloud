/*
    WordCloud 1.0
     
    Author: Lorenzo Gaggini, lgaggini.net, 2011
     
    Licensed under: GNU Affero General Public License 3.0 <https://www.gnu.org/licenses/agpl-3.0.html>
*/

var wordFilter = ["", "e", "o", "ed", "è", "lo", "l", "il", "la", "gli", "gl", "i", "le", "li", "dei", "del", "della", "dello", "degli", "delle", "uno", "un", "una", "di", "a", "da", "in", "con", "su", "per", "tra", "fra", "davanti", "dopo", "vicino", "lungo", "durante", "verso", "mediante", "secondo", "dato", "ancora", "ora", "mai", "sempre", "prima", "dopo", "ieri", "oggi", "domani", "subito", "presto", "frequentemente", "spesso", "lì", "là", "qui", "qua", "giù", "su", "laggiù", "lassù", "davanti", "dietro", "sopra", "sotto", "dentro", "fuori", "altrove", "intorno", "ci", "vi", "poco", "tanto", "più", "meno", "parecchio", "appena", "abbastanza", "troppo", "assai", "quasi", "piuttosto", "quasi", "quanto", "purtroppo", "giustamente", "fortunatamente", "stranamente", "sì", "esattamente", "certamente", "certo", "davvero", "sicuro", "sicuramente", "appunto", "proprio", "no", "non", "né", "neppure", "neanche", "nemmeno", "affatto", "forse", "magari", "chissà", "probabilmente", "eventualmente", "come", "dove", "quando", "quanto", "perché", "proprio", "ecco", "come", "tipo", "che"]; //filtro definito staticamente per escludere dalla valutazione parole non sensibili ai fini del calcolo

var wordMinLength = 4; //limite inferiore definito staticamente per le lettere minime di una parola da prendere in considerazione

var weightLimit = 1; //limite inferiore definito staticamente per il peso per visualizzare la relativa parola

var fontSizeRatio = 1.7; //Rapporto fra il peso delle parole e la grandezza in em nella nuvola

var tagWeight = {H1: 3.5, H2: 3, H3: 2.5, H4: 2, H5: 1.5, H6: 1, STRONG: 0.4, A: 0.2, P: 0.1}; //struttura dati definita staticamente per determinare tag da analizzare e relativo peso
 
var wordWeight; //struttura dati usata per memorizzare le parole e i relativi pesi

var pageCheckStats; //struttura dati usata per memorizzare le statitstiche relative alle realizzazione della nuvola
 
 
//funzione principale per l'analisi della pagina
function pageCheck(doc, resultDocument)
{
    //inizializzo le struttura dati
    wordWeight = {};
    pageCheckStats = {tagCount: 0, H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0, STRONG: 0, A: 0, P: 0, wordCount: 0, wordGarbage: 0, wordMax: "no word", wordMaxWeight: 0};
    
    //per ogni tipo di tag predefinito ottengo la lista di tutte le istanze
    for (var tag in tagWeight)
    {   
        var tagList = doc.getElementsByTagName(tag);
        pageCheckStats["tagCount"]++;
        pageCheckStats[tag] = tagList.length;
        
        if (tagList.length > 0)
        {
            //per ogni istanza ottengo il contenuto testuale del tag e lo divido in parole
            for (var i = 0; i < tagList.length; i++)
            {
                for (var j = 0; j < tagList[i].childNodes.length; j++)
                {
                    var nodeText = tagList[i].childNodes[j].nodeValue;
                                
                    var regExpSeparator = /[^a-zA-Z0-9òàèéùì_]+/g;//separatore per ottenere solo le parole
                    if (nodeText != null)
                        var words = (nodeText.replace(/^\s+|\s+$/g, '')).split(regExpSeparator);//applicazione del separatore per ottenere la lista delle parole            
                                        
                    //elaborazione sulla singola parola
                    for (var y = 0; y < words.length; y++)
                    {
                        
                        pageCheckStats["wordCount"]++;
                                        
                        //per ogni parola che supera il filtro se la parola è già stata trovata se ne incrementa il peso totale altrimenti si aggiunge inizializzandone il peso
                        if (wordFilterCheck(words[y].toLowerCase()))
                        {       
                            wordWeight.hasOwnProperty(words[y].toLowerCase()) ? wordWeight[words[y].toLowerCase()] += tagWeight[tag] : wordWeight[words[y].toLowerCase()] = tagWeight[tag];
                        }
                        else
                            pageCheckStats["wordGarbage"]++;
                    }
                }
            }
        }   
    }

    //creazione della nuvola e delle statistiche
    
    cloudCreate(resultDocument.getElementById("cloud"));
    statsCreate(resultDocument.getElementById("stats"));
    
}


//funzione per la creazione della nuvola delle parole
function cloudCreate(resultBlock)
{
    weightFilter();//filtro sul peso delle parole
    
    //creazione blocco parole
    var cloud = document.createElement("div");
    cloud.setAttribute("id", "cloud");
                
    for (word in wordWeight)
    {
        
        var weight = wordWeight[word];
        
        //aggiornamento statistiche
        if (weight > pageCheckStats["wordMaxWeight"])
        {
            pageCheckStats["wordMax"] = word;
            pageCheckStats["wordMaxWeight"] = weight; 
        }
        
        //creazione singola word e inserimento nel blocco
        var elem = document.createElement("A");
        var fontSize = weight/fontSizeRatio + "em";
        elem.style.fontSize = fontSize;
        elem.appendChild(document.createTextNode(word));
        elem.appendChild(document.createTextNode(" "));
        cloud.appendChild(elem);
    }   

    //sostituzione al blocco passato come argomento
    resultBlock.parentNode.replaceChild(cloud, resultBlock);
    
}


//funzione per la creazione delle statistiche
function statsCreate(resultBlock)
{
    //creazione blocco statistiche
    var cloudStats = document.createElement("div");
    cloudStats.setAttribute("id", "stats");

    //creazione paragrafo statistiche e aggiunta statistiche testuali
    var stats = document.createElement("P");    
    stats.appendChild(document.createTextNode("Tipi di tag esaminati: " + pageCheckStats["tagCount"]));
    stats.appendChild(document.createElement("br"));
    
    for (var tag in tagWeight)
    {
        stats.appendChild(document.createTextNode("Tag " + tag + " esaminati: " + pageCheckStats[tag]));
        stats.appendChild(document.createElement("br"));
    }
    
    stats.appendChild(document.createTextNode("Parole esaminate: " + pageCheckStats["wordCount"]));
    stats.appendChild(document.createElement("br"));
    stats.appendChild(document.createTextNode("Parole Filtrate: " + pageCheckStats["wordGarbage"]));
    stats.appendChild(document.createElement("br"));
    stats.appendChild(document.createTextNode("Parola più pesante: " + pageCheckStats["wordMax"] + ", peso: " + pageCheckStats["wordMaxWeight"]));
    
    //inserimeneto del paragrafo statistiche nel blocco e sostituzione al blocco passato come argomento
    cloudStats.appendChild(stats);
    resultBlock.parentNode.replaceChild(cloudStats, resultBlock);

}


//funzione per applicare il filtro sulle parole in base al dizionario e alla lunghezza
function wordFilterCheck(word)
{
    for (var i = 0; i < wordFilter.length; i++)
        if (word == wordFilter[i] || word.length < wordMinLength)
            return false;
    return true;
}


//funzione per applicare il filtro sul peso minimo delle parole da includere
function weightFilter()
{
    for (word in wordWeight)
        if (wordWeight[word] < weightLimit)
            delete wordWeight[word];
}
