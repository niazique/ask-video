// Interface translations. Keys are the English strings themselves, so any message
// (including errors from main.js and the native helper) is translated by its text,
// and unknown text simply stays in English.
// Used by popup.html (<script>) and background.js (importScripts).

const I18N = {
  ru: {
    // Popup
    'Language': 'Язык',
    'Copy the subtitles as an .srt file': 'Скопировать субтитры файлом .srt',
    'Copy .srt file': 'Скопировать файл .srt',
    'Original': 'Оригинал',
    'English': 'Английский',
    'Also in the right-click menu on YouTube': 'Также есть в меню правого клика на YouTube',
    'Summarize it': 'Перескажи вкратце',
    'Summarize this video.': 'Кратко перескажи это видео.',
    'Ask anything about this video…': 'Спросите что угодно об этом видео…',
    'Claude has already watched this video and is ready to answer any question about it!': 'Клодик уже посмотрел этот видос, и готов ответить на любой вопрос по нему!',
    'Claude is thinking': 'Claude думает',
    'Jump to this moment': 'Перейти к этому моменту',
    'Could not jump to this moment': 'Не удалось перейти к этому моменту',
    'Could not get subtitles': 'Не удалось получить субтитры',
    'Copied as text: the file-copy helper is not installed': 'Скопировано как текст: помощник для копирования файлом не установлен',
    'Open a YouTube video to ask Claude about it.': 'Откройте видео на YouTube, чтобы спросить о нём Claude.',
    'Reload the video tab (it was opened before the extension was installed).': 'Обновите вкладку с видео (она была открыта до установки расширения).',
    'auto-translated': 'автоперевод',
    'not available': 'недоступно',

    // Model picker
    'Model': 'Модель',
    'Auto': 'Авто',

    // Answer length
    'How detailed the answer is': 'Насколько подробным будет ответ',
    'tl;dr': 'тл;др',
    'normal': 'норм',
    'lecture': 'лекция',

    // Claude Code setup instructions
    'Sign in to Claude Code': 'Войдите в Claude Code',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'ASK Video отвечает через Claude Code на этом Mac, но вход в него не выполнен.',
    'Open the Terminal app.': 'Откройте приложение «Терминал».',
    'Run this command:': 'Выполните команду:',
    'Sign in with your Claude account in the browser that opens.': 'В открывшемся браузере войдите в свой аккаунт Claude.',
    'Come back here and press Check again.': 'Вернитесь сюда и нажмите «Проверить снова».',
    'Install Claude Code': 'Установите Claude Code',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'ASK Video отвечает через Claude Code, но на этом Mac он не найден.',
    'Install it in Terminal:': 'Установите его в Терминале:',
    'Sign in:': 'Войдите:',
    'Run the helper installer again from the extension folder:': 'Снова запустите установщик помощника из папки расширения:',
    'Install the ASK Video helper': 'Установите помощник ASK Video',
    'The helper connects the extension to Claude Code and copies .srt files.': 'Помощник связывает расширение с Claude Code и копирует файлы .srt.',
    'In Terminal, open the extension folder and run:': 'В Терминале откройте папку расширения и выполните:',
    'Reload the extension at chrome://extensions.': 'Обновите расширение на chrome://extensions.',
    'Could not check Claude Code': 'Не удалось проверить Claude Code',
    'Something went wrong while checking Claude Code.': 'При проверке Claude Code что-то пошло не так.',
    'Make sure it works in Terminal:': 'Проверьте, что он работает в Терминале:',
    'Click to copy': 'Нажмите, чтобы скопировать',
    'Copied': 'Скопировано',
    'Check again': 'Проверить снова',
    'Checking…': 'Проверяю…',

    // Context menu and on-page notifications
    'Copy subtitles file': 'Скопировать файл с субтитрами',
    'Original language': 'Язык оригинала',
    'File copied: {0}': 'Файл скопирован: {0}',
    'Copied as text ({0}): the file helper is not installed': 'Скопировано как текст ({0}): помощник для файлов не установлен',
    'Could not copy subtitles': 'Не удалось скопировать субтитры',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': 'Помощник ASK Video не установлен. Запустите native/install.sh',
    'No answer from the helper': 'Помощник не ответил',
    'The helper stopped without an answer': 'Помощник завершился без ответа',
    'The helper returned an error': 'Помощник вернул ошибку',
    'Reload the video tab (it was opened before the extension was installed)': 'Обновите вкладку с видео (она была открыта до установки расширения)',
    'The video changed. Reopen the popup': 'Видео сменилось. Откройте окно расширения заново',
    'The page did not respond. Reload the tab': 'Страница не ответила. Обновите вкладку',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'Claude Code не авторизован. Запустите `claude` в Терминале и войдите через /login',
    'Claude took too long to answer. Try again': 'Claude отвечал слишком долго. Попробуйте ещё раз',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': 'Claude Code (claude) не найден. Установите его и снова запустите native/install.sh',

    // Subtitle errors from main.js
    'Open a video page': 'Откройте страницу с видео',
    'The player has not loaded yet': 'Плеер ещё не загрузился',
    'The player is not ready': 'Плеер ещё не готов',
    'The video is still loading (or an ad is playing). Try again in a few seconds': 'Видео ещё загружается (или идёт реклама). Попробуйте через пару секунд',
    'This video has no subtitles': 'У этого видео нет субтитров',
    'Could not get subtitles from the player. Reload the page and try again': 'Не удалось получить субтитры от плеера. Обновите страницу и попробуйте ещё раз',
    'No English subtitles, and auto-translation is not available for this video': 'Английских субтитров нет, и автоперевод для этого видео недоступен',
    'Subtitle track not found': 'Дорожка субтитров не найдена',
    'YouTube did not return subtitles. Reload the page and try again': 'YouTube не отдал субтитры. Обновите страницу и попробуйте ещё раз',
    'The subtitles are empty': 'Субтитры пустые',
    'English (auto-translated)': 'English (автоперевод)',
  },
  de: {
    // Popup
    'Language': 'Sprache',
    'Copy the subtitles as an .srt file': 'Untertitel als .srt-Datei kopieren',
    'Copy .srt file': '.srt-Datei kopieren',
    'Original': 'Original',
    'English': 'Englisch',
    'Also in the right-click menu on YouTube': 'Auch im Rechtsklick-Menü auf YouTube',
    'Summarize it': 'Kurz zusammenfassen',
    'Summarize this video.': 'Fasse dieses Video kurz zusammen.',
    'Ask anything about this video…': 'Frag alles zu diesem Video…',
    'Claude has already watched this video and is ready to answer any question about it!': 'Claude hat dieses Video schon gesehen und beantwortet jede Frage dazu!',
    'Claude is thinking': 'Claude denkt nach',
    'Jump to this moment': 'Zu dieser Stelle springen',
    'Could not jump to this moment': 'Konnte nicht zu dieser Stelle springen',
    'Could not get subtitles': 'Untertitel konnten nicht geladen werden',
    'Copied as text: the file-copy helper is not installed': 'Als Text kopiert: Der Datei-Helfer ist nicht installiert',
    'Open a YouTube video to ask Claude about it.': 'Öffne ein YouTube-Video, um Claude dazu zu fragen.',
    'Reload the video tab (it was opened before the extension was installed).': 'Lade den Video-Tab neu (er wurde vor der Installation geöffnet).',
    'auto-translated': 'automatisch übersetzt',
    'not available': 'nicht verfügbar',

    // Model picker
    'Model': 'Modell',
    'Auto': 'Auto',

    // Answer length
    'How detailed the answer is': 'Wie ausführlich die Antwort ist',
    'tl;dr': 'tl;dr',
    'normal': 'normal',
    'lecture': 'Vorlesung',

    // Claude Code setup instructions
    'Sign in to Claude Code': 'Bei Claude Code anmelden',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'ASK Video antwortet über Claude Code auf diesem Mac, aber du bist nicht angemeldet.',
    'Open the Terminal app.': 'Öffne die App „Terminal“.',
    'Run this command:': 'Führe diesen Befehl aus:',
    'Sign in with your Claude account in the browser that opens.': 'Melde dich im geöffneten Browser mit deinem Claude-Konto an.',
    'Come back here and press Check again.': 'Komm zurück und klicke auf „Erneut prüfen“.',
    'Install Claude Code': 'Claude Code installieren',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'ASK Video antwortet über Claude Code, aber es wurde auf diesem Mac nicht gefunden.',
    'Install it in Terminal:': 'Installiere es im Terminal:',
    'Sign in:': 'Anmelden:',
    'Run the helper installer again from the extension folder:': 'Starte den Helfer-Installer erneut aus dem Erweiterungsordner:',
    'Install the ASK Video helper': 'ASK Video-Helfer installieren',
    'The helper connects the extension to Claude Code and copies .srt files.': 'Der Helfer verbindet die Erweiterung mit Claude Code und kopiert .srt-Dateien.',
    'In Terminal, open the extension folder and run:': 'Öffne im Terminal den Erweiterungsordner und führe aus:',
    'Reload the extension at chrome://extensions.': 'Lade die Erweiterung unter chrome://extensions neu.',
    'Could not check Claude Code': 'Claude Code konnte nicht geprüft werden',
    'Something went wrong while checking Claude Code.': 'Beim Prüfen von Claude Code ist etwas schiefgelaufen.',
    'Make sure it works in Terminal:': 'Prüfe, ob es im Terminal funktioniert:',
    'Click to copy': 'Zum Kopieren klicken',
    'Copied': 'Kopiert',
    'Check again': 'Erneut prüfen',
    'Checking…': 'Prüfe…',

    // Context menu and on-page notifications
    'Copy subtitles file': 'Untertiteldatei kopieren',
    'Original language': 'Originalsprache',
    'File copied: {0}': 'Datei kopiert: {0}',
    'Copied as text ({0}): the file helper is not installed': 'Als Text kopiert ({0}): Der Datei-Helfer ist nicht installiert',
    'Could not copy subtitles': 'Untertitel konnten nicht kopiert werden',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': 'Der ASK Video-Helfer ist nicht installiert. Führe native/install.sh aus',
    'No answer from the helper': 'Keine Antwort vom Helfer',
    'The helper stopped without an answer': 'Der Helfer wurde ohne Antwort beendet',
    'The helper returned an error': 'Der Helfer hat einen Fehler gemeldet',
    'Reload the video tab (it was opened before the extension was installed)': 'Lade den Video-Tab neu (er wurde vor der Installation geöffnet)',
    'The video changed. Reopen the popup': 'Das Video hat sich geändert. Öffne das Fenster erneut',
    'The page did not respond. Reload the tab': 'Die Seite reagiert nicht. Lade den Tab neu',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'Claude Code ist nicht angemeldet. Starte `claude` im Terminal und melde dich mit /login an',
    'Claude took too long to answer. Try again': 'Claude hat zu lange gebraucht. Versuch es noch einmal',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': 'Claude Code (claude) wurde nicht gefunden. Installiere es und führe native/install.sh erneut aus',

    // Subtitle errors from main.js
    'Open a video page': 'Öffne eine Videoseite',
    'The player has not loaded yet': 'Der Player ist noch nicht geladen',
    'The player is not ready': 'Der Player ist nicht bereit',
    'The video is still loading (or an ad is playing). Try again in a few seconds': 'Das Video lädt noch (oder es läuft Werbung). Versuch es in ein paar Sekunden erneut',
    'This video has no subtitles': 'Dieses Video hat keine Untertitel',
    'Could not get subtitles from the player. Reload the page and try again': 'Untertitel konnten nicht vom Player geladen werden. Lade die Seite neu und versuch es erneut',
    'No English subtitles, and auto-translation is not available for this video': 'Keine englischen Untertitel, und automatische Übersetzung ist für dieses Video nicht verfügbar',
    'Subtitle track not found': 'Untertitelspur nicht gefunden',
    'YouTube did not return subtitles. Reload the page and try again': 'YouTube hat keine Untertitel geliefert. Lade die Seite neu und versuch es erneut',
    'The subtitles are empty': 'Die Untertitel sind leer',
    'English (auto-translated)': 'English (automatisch übersetzt)',
  },
  fr: {
    // Popup
    'Language': 'Langue',
    'Copy the subtitles as an .srt file': 'Copier les sous-titres en fichier .srt',
    'Copy .srt file': 'Copier le fichier .srt',
    'Original': 'Original',
    'English': 'Anglais',
    'Also in the right-click menu on YouTube': 'Aussi dans le menu clic droit sur YouTube',
    'Summarize it': 'Résume-la',
    'Summarize this video.': 'Résume cette vidéo.',
    'Ask anything about this video…': 'Posez une question sur cette vidéo…',
    'Claude has already watched this video and is ready to answer any question about it!': 'Claude a déjà regardé cette vidéo et peut répondre à toutes vos questions !',
    'Claude is thinking': 'Claude réfléchit',
    'Jump to this moment': 'Aller à ce moment',
    'Could not jump to this moment': 'Impossible d’aller à ce moment',
    'Could not get subtitles': 'Impossible de récupérer les sous-titres',
    'Copied as text: the file-copy helper is not installed': 'Copié en texte : l’assistant de copie de fichier n’est pas installé',
    'Open a YouTube video to ask Claude about it.': 'Ouvrez une vidéo YouTube pour interroger Claude à son sujet.',
    'Reload the video tab (it was opened before the extension was installed).': 'Rechargez l’onglet de la vidéo (il a été ouvert avant l’installation).',
    'auto-translated': 'traduction auto',
    'not available': 'indisponible',

    // Model picker
    'Model': 'Modèle',
    'Auto': 'Auto',

    // Answer length
    'How detailed the answer is': 'Niveau de détail de la réponse',
    'tl;dr': 'tl;dr',
    'normal': 'normal',
    'lecture': 'conférence',

    // Claude Code setup instructions
    'Sign in to Claude Code': 'Connectez-vous à Claude Code',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'ASK Video répond via Claude Code sur ce Mac, mais vous n’êtes pas connecté.',
    'Open the Terminal app.': 'Ouvrez l’app Terminal.',
    'Run this command:': 'Exécutez cette commande :',
    'Sign in with your Claude account in the browser that opens.': 'Connectez-vous avec votre compte Claude dans le navigateur qui s’ouvre.',
    'Come back here and press Check again.': 'Revenez ici et cliquez sur « Vérifier à nouveau ».',
    'Install Claude Code': 'Installez Claude Code',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'ASK Video répond via Claude Code, mais il est introuvable sur ce Mac.',
    'Install it in Terminal:': 'Installez-le dans le Terminal :',
    'Sign in:': 'Connectez-vous :',
    'Run the helper installer again from the extension folder:': 'Relancez l’installateur de l’assistant depuis le dossier de l’extension :',
    'Install the ASK Video helper': 'Installez l’assistant ASK Video',
    'The helper connects the extension to Claude Code and copies .srt files.': 'L’assistant relie l’extension à Claude Code et copie les fichiers .srt.',
    'In Terminal, open the extension folder and run:': 'Dans le Terminal, ouvrez le dossier de l’extension et exécutez :',
    'Reload the extension at chrome://extensions.': 'Rechargez l’extension sur chrome://extensions.',
    'Could not check Claude Code': 'Impossible de vérifier Claude Code',
    'Something went wrong while checking Claude Code.': 'Un problème est survenu lors de la vérification de Claude Code.',
    'Make sure it works in Terminal:': 'Vérifiez qu’il fonctionne dans le Terminal :',
    'Click to copy': 'Cliquer pour copier',
    'Copied': 'Copié',
    'Check again': 'Vérifier à nouveau',
    'Checking…': 'Vérification…',

    // Context menu and on-page notifications
    'Copy subtitles file': 'Copier le fichier de sous-titres',
    'Original language': 'Langue d’origine',
    'File copied: {0}': 'Fichier copié : {0}',
    'Copied as text ({0}): the file helper is not installed': 'Copié en texte ({0}) : l’assistant de fichiers n’est pas installé',
    'Could not copy subtitles': 'Impossible de copier les sous-titres',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': 'L’assistant ASK Video n’est pas installé. Lancez native/install.sh',
    'No answer from the helper': 'Pas de réponse de l’assistant',
    'The helper stopped without an answer': 'L’assistant s’est arrêté sans répondre',
    'The helper returned an error': 'L’assistant a renvoyé une erreur',
    'Reload the video tab (it was opened before the extension was installed)': 'Rechargez l’onglet de la vidéo (il a été ouvert avant l’installation)',
    'The video changed. Reopen the popup': 'La vidéo a changé. Rouvrez la fenêtre',
    'The page did not respond. Reload the tab': 'La page ne répond pas. Rechargez l’onglet',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'Claude Code n’est pas connecté. Lancez `claude` dans le Terminal et connectez-vous avec /login',
    'Claude took too long to answer. Try again': 'Claude a mis trop de temps à répondre. Réessayez',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': 'Claude Code (claude) est introuvable. Installez-le, puis relancez native/install.sh',

    // Subtitle errors from main.js
    'Open a video page': 'Ouvrez une page vidéo',
    'The player has not loaded yet': 'Le lecteur n’est pas encore chargé',
    'The player is not ready': 'Le lecteur n’est pas prêt',
    'The video is still loading (or an ad is playing). Try again in a few seconds': 'La vidéo est en cours de chargement (ou une pub est diffusée). Réessayez dans quelques secondes',
    'This video has no subtitles': 'Cette vidéo n’a pas de sous-titres',
    'Could not get subtitles from the player. Reload the page and try again': 'Impossible de récupérer les sous-titres du lecteur. Rechargez la page et réessayez',
    'No English subtitles, and auto-translation is not available for this video': 'Pas de sous-titres anglais, et la traduction automatique n’est pas disponible pour cette vidéo',
    'Subtitle track not found': 'Piste de sous-titres introuvable',
    'YouTube did not return subtitles. Reload the page and try again': 'YouTube n’a pas renvoyé de sous-titres. Rechargez la page et réessayez',
    'The subtitles are empty': 'Les sous-titres sont vides',
    'English (auto-translated)': 'English (traduction auto)',
  },
  it: {
    // Popup
    'Language': 'Lingua',
    'Copy the subtitles as an .srt file': 'Copia i sottotitoli come file .srt',
    'Copy .srt file': 'Copia file .srt',
    'Original': 'Originale',
    'English': 'Inglese',
    'Also in the right-click menu on YouTube': 'Anche nel menu del tasto destro su YouTube',
    'Summarize it': 'Riassumilo',
    'Summarize this video.': 'Riassumi questo video.',
    'Ask anything about this video…': 'Chiedi qualsiasi cosa su questo video…',
    'Claude has already watched this video and is ready to answer any question about it!': 'Claude ha già visto questo video ed è pronto a rispondere a qualsiasi domanda!',
    'Claude is thinking': 'Claude sta pensando',
    'Jump to this moment': 'Vai a questo momento',
    'Could not jump to this moment': 'Impossibile andare a questo momento',
    'Could not get subtitles': 'Impossibile ottenere i sottotitoli',
    'Copied as text: the file-copy helper is not installed': 'Copiato come testo: l’helper per copiare i file non è installato',
    'Open a YouTube video to ask Claude about it.': 'Apri un video di YouTube per chiedere a Claude.',
    'Reload the video tab (it was opened before the extension was installed).': 'Ricarica la scheda del video (era aperta prima dell’installazione).',
    'auto-translated': 'traduzione automatica',
    'not available': 'non disponibile',

    // Model picker
    'Model': 'Modello',
    'Auto': 'Auto',

    // Answer length
    'How detailed the answer is': 'Quanto è dettagliata la risposta',
    'tl;dr': 'tl;dr',
    'normal': 'normale',
    'lecture': 'lezione',

    // Claude Code setup instructions
    'Sign in to Claude Code': 'Accedi a Claude Code',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'ASK Video risponde tramite Claude Code su questo Mac, ma non hai effettuato l’accesso.',
    'Open the Terminal app.': 'Apri l’app Terminale.',
    'Run this command:': 'Esegui questo comando:',
    'Sign in with your Claude account in the browser that opens.': 'Accedi con il tuo account Claude nel browser che si apre.',
    'Come back here and press Check again.': 'Torna qui e premi «Controlla di nuovo».',
    'Install Claude Code': 'Installa Claude Code',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'ASK Video risponde tramite Claude Code, ma non è stato trovato su questo Mac.',
    'Install it in Terminal:': 'Installalo nel Terminale:',
    'Sign in:': 'Accedi:',
    'Run the helper installer again from the extension folder:': 'Esegui di nuovo l’installer dell’helper dalla cartella dell’estensione:',
    'Install the ASK Video helper': 'Installa l’helper di ASK Video',
    'The helper connects the extension to Claude Code and copies .srt files.': 'L’helper collega l’estensione a Claude Code e copia i file .srt.',
    'In Terminal, open the extension folder and run:': 'Nel Terminale, apri la cartella dell’estensione ed esegui:',
    'Reload the extension at chrome://extensions.': 'Ricarica l’estensione su chrome://extensions.',
    'Could not check Claude Code': 'Impossibile verificare Claude Code',
    'Something went wrong while checking Claude Code.': 'Qualcosa è andato storto durante la verifica di Claude Code.',
    'Make sure it works in Terminal:': 'Verifica che funzioni nel Terminale:',
    'Click to copy': 'Clicca per copiare',
    'Copied': 'Copiato',
    'Check again': 'Controlla di nuovo',
    'Checking…': 'Controllo…',

    // Context menu and on-page notifications
    'Copy subtitles file': 'Copia il file dei sottotitoli',
    'Original language': 'Lingua originale',
    'File copied: {0}': 'File copiato: {0}',
    'Copied as text ({0}): the file helper is not installed': 'Copiato come testo ({0}): l’helper per i file non è installato',
    'Could not copy subtitles': 'Impossibile copiare i sottotitoli',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': 'L’helper di ASK Video non è installato. Esegui native/install.sh',
    'No answer from the helper': 'Nessuna risposta dall’helper',
    'The helper stopped without an answer': 'L’helper si è fermato senza rispondere',
    'The helper returned an error': 'L’helper ha restituito un errore',
    'Reload the video tab (it was opened before the extension was installed)': 'Ricarica la scheda del video (era aperta prima dell’installazione)',
    'The video changed. Reopen the popup': 'Il video è cambiato. Riapri la finestra',
    'The page did not respond. Reload the tab': 'La pagina non risponde. Ricarica la scheda',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'Claude Code non ha effettuato l’accesso. Avvia `claude` nel Terminale e accedi con /login',
    'Claude took too long to answer. Try again': 'Claude ci ha messo troppo a rispondere. Riprova',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': 'Claude Code (claude) non trovato. Installalo e poi esegui di nuovo native/install.sh',

    // Subtitle errors from main.js
    'Open a video page': 'Apri la pagina di un video',
    'The player has not loaded yet': 'Il player non è ancora caricato',
    'The player is not ready': 'Il player non è pronto',
    'The video is still loading (or an ad is playing). Try again in a few seconds': 'Il video si sta ancora caricando (o c’è una pubblicità). Riprova tra qualche secondo',
    'This video has no subtitles': 'Questo video non ha sottotitoli',
    'Could not get subtitles from the player. Reload the page and try again': 'Impossibile ottenere i sottotitoli dal player. Ricarica la pagina e riprova',
    'No English subtitles, and auto-translation is not available for this video': 'Nessun sottotitolo in inglese e la traduzione automatica non è disponibile per questo video',
    'Subtitle track not found': 'Traccia dei sottotitoli non trovata',
    'YouTube did not return subtitles. Reload the page and try again': 'YouTube non ha restituito i sottotitoli. Ricarica la pagina e riprova',
    'The subtitles are empty': 'I sottotitoli sono vuoti',
    'English (auto-translated)': 'English (traduzione automatica)',
  },
  es: {
    // Popup
    'Language': 'Idioma',
    'Copy the subtitles as an .srt file': 'Copiar los subtítulos como archivo .srt',
    'Copy .srt file': 'Copiar archivo .srt',
    'Original': 'Original',
    'English': 'Inglés',
    'Also in the right-click menu on YouTube': 'También en el menú del clic derecho en YouTube',
    'Summarize it': 'Resúmelo',
    'Summarize this video.': 'Resume este vídeo.',
    'Ask anything about this video…': 'Pregunta lo que quieras sobre este vídeo…',
    'Claude has already watched this video and is ready to answer any question about it!': '¡Claude ya ha visto este vídeo y está listo para responder cualquier pregunta!',
    'Claude is thinking': 'Claude está pensando',
    'Jump to this moment': 'Ir a este momento',
    'Could not jump to this moment': 'No se pudo ir a este momento',
    'Could not get subtitles': 'No se pudieron obtener los subtítulos',
    'Copied as text: the file-copy helper is not installed': 'Copiado como texto: el asistente para copiar archivos no está instalado',
    'Open a YouTube video to ask Claude about it.': 'Abre un vídeo de YouTube para preguntarle a Claude.',
    'Reload the video tab (it was opened before the extension was installed).': 'Recarga la pestaña del vídeo (se abrió antes de instalar la extensión).',
    'auto-translated': 'traducción automática',
    'not available': 'no disponible',

    // Model picker
    'Model': 'Modelo',
    'Auto': 'Auto',

    // Answer length
    'How detailed the answer is': 'Qué tan detallada es la respuesta',
    'tl;dr': 'tl;dr',
    'normal': 'normal',
    'lecture': 'conferencia',

    // Claude Code setup instructions
    'Sign in to Claude Code': 'Inicia sesión en Claude Code',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'ASK Video responde a través de Claude Code en este Mac, pero no has iniciado sesión.',
    'Open the Terminal app.': 'Abre la app Terminal.',
    'Run this command:': 'Ejecuta este comando:',
    'Sign in with your Claude account in the browser that opens.': 'Inicia sesión con tu cuenta de Claude en el navegador que se abre.',
    'Come back here and press Check again.': 'Vuelve aquí y pulsa «Comprobar de nuevo».',
    'Install Claude Code': 'Instala Claude Code',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'ASK Video responde a través de Claude Code, pero no se encontró en este Mac.',
    'Install it in Terminal:': 'Instálalo en Terminal:',
    'Sign in:': 'Inicia sesión:',
    'Run the helper installer again from the extension folder:': 'Vuelve a ejecutar el instalador del asistente desde la carpeta de la extensión:',
    'Install the ASK Video helper': 'Instala el asistente de ASK Video',
    'The helper connects the extension to Claude Code and copies .srt files.': 'El asistente conecta la extensión con Claude Code y copia archivos .srt.',
    'In Terminal, open the extension folder and run:': 'En Terminal, abre la carpeta de la extensión y ejecuta:',
    'Reload the extension at chrome://extensions.': 'Recarga la extensión en chrome://extensions.',
    'Could not check Claude Code': 'No se pudo comprobar Claude Code',
    'Something went wrong while checking Claude Code.': 'Algo salió mal al comprobar Claude Code.',
    'Make sure it works in Terminal:': 'Comprueba que funciona en Terminal:',
    'Click to copy': 'Haz clic para copiar',
    'Copied': 'Copiado',
    'Check again': 'Comprobar de nuevo',
    'Checking…': 'Comprobando…',

    // Context menu and on-page notifications
    'Copy subtitles file': 'Copiar archivo de subtítulos',
    'Original language': 'Idioma original',
    'File copied: {0}': 'Archivo copiado: {0}',
    'Copied as text ({0}): the file helper is not installed': 'Copiado como texto ({0}): el asistente de archivos no está instalado',
    'Could not copy subtitles': 'No se pudieron copiar los subtítulos',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': 'El asistente de ASK Video no está instalado. Ejecuta native/install.sh',
    'No answer from the helper': 'El asistente no respondió',
    'The helper stopped without an answer': 'El asistente se detuvo sin responder',
    'The helper returned an error': 'El asistente devolvió un error',
    'Reload the video tab (it was opened before the extension was installed)': 'Recarga la pestaña del vídeo (se abrió antes de instalar la extensión)',
    'The video changed. Reopen the popup': 'El vídeo cambió. Vuelve a abrir la ventana',
    'The page did not respond. Reload the tab': 'La página no respondió. Recarga la pestaña',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'Claude Code no ha iniciado sesión. Ejecuta `claude` en Terminal e inicia sesión con /login',
    'Claude took too long to answer. Try again': 'Claude tardó demasiado en responder. Inténtalo de nuevo',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': 'No se encontró Claude Code (claude). Instálalo y vuelve a ejecutar native/install.sh',

    // Subtitle errors from main.js
    'Open a video page': 'Abre la página de un vídeo',
    'The player has not loaded yet': 'El reproductor aún no se ha cargado',
    'The player is not ready': 'El reproductor no está listo',
    'The video is still loading (or an ad is playing). Try again in a few seconds': 'El vídeo aún se está cargando (o hay un anuncio). Inténtalo en unos segundos',
    'This video has no subtitles': 'Este vídeo no tiene subtítulos',
    'Could not get subtitles from the player. Reload the page and try again': 'No se pudieron obtener los subtítulos del reproductor. Recarga la página e inténtalo de nuevo',
    'No English subtitles, and auto-translation is not available for this video': 'No hay subtítulos en inglés y la traducción automática no está disponible para este vídeo',
    'Subtitle track not found': 'No se encontró la pista de subtítulos',
    'YouTube did not return subtitles. Reload the page and try again': 'YouTube no devolvió los subtítulos. Recarga la página e inténtalo de nuevo',
    'The subtitles are empty': 'Los subtítulos están vacíos',
    'English (auto-translated)': 'English (traducción automática)',
  },
  zh: {
    // Popup
    'Language': '语言',
    'Copy the subtitles as an .srt file': '将字幕复制为 .srt 文件',
    'Copy .srt file': '复制 .srt 文件',
    'Original': '原语言',
    'English': '英语',
    'Also in the right-click menu on YouTube': '也可在 YouTube 页面的右键菜单中使用',
    'Summarize it': '总结一下',
    'Summarize this video.': '请总结这个视频。',
    'Ask anything about this video…': '关于这个视频，问什么都行…',
    'Claude has already watched this video and is ready to answer any question about it!': 'Claude 已经看完这个视频，随时回答你的任何问题！',
    'Claude is thinking': 'Claude 正在思考',
    'Jump to this moment': '跳转到此处',
    'Could not jump to this moment': '无法跳转到此处',
    'Could not get subtitles': '无法获取字幕',
    'Copied as text: the file-copy helper is not installed': '已作为文本复制：未安装文件复制助手',
    'Open a YouTube video to ask Claude about it.': '打开一个 YouTube 视频，就可以向 Claude 提问。',
    'Reload the video tab (it was opened before the extension was installed).': '请刷新视频标签页（它在安装扩展之前就已打开）。',
    'auto-translated': '自动翻译',
    'not available': '不可用',

    // Model picker
    'Model': '模型',
    'Auto': '自动',

    // Answer length
    'How detailed the answer is': '回答的详细程度',
    'tl;dr': '一句话',
    'normal': '正常',
    'lecture': '讲座',

    // Claude Code setup instructions
    'Sign in to Claude Code': '登录 Claude Code',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'ASK Video 通过这台 Mac 上的 Claude Code 回答问题，但尚未登录。',
    'Open the Terminal app.': '打开“终端”应用。',
    'Run this command:': '运行以下命令：',
    'Sign in with your Claude account in the browser that opens.': '在打开的浏览器中登录你的 Claude 账号。',
    'Come back here and press Check again.': '回到这里，点击“重新检查”。',
    'Install Claude Code': '安装 Claude Code',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'ASK Video 通过 Claude Code 回答问题，但在这台 Mac 上找不到它。',
    'Install it in Terminal:': '在终端中安装：',
    'Sign in:': '登录：',
    'Run the helper installer again from the extension folder:': '在扩展文件夹中重新运行助手安装程序：',
    'Install the ASK Video helper': '安装 ASK Video 助手',
    'The helper connects the extension to Claude Code and copies .srt files.': '助手负责连接扩展与 Claude Code，并复制 .srt 文件。',
    'In Terminal, open the extension folder and run:': '在终端中进入扩展文件夹并运行：',
    'Reload the extension at chrome://extensions.': '在 chrome://extensions 中重新加载扩展。',
    'Could not check Claude Code': '无法检查 Claude Code',
    'Something went wrong while checking Claude Code.': '检查 Claude Code 时出了问题。',
    'Make sure it works in Terminal:': '确认它在终端中能正常运行：',
    'Click to copy': '点击复制',
    'Copied': '已复制',
    'Check again': '重新检查',
    'Checking…': '正在检查…',

    // Context menu and on-page notifications
    'Copy subtitles file': '复制字幕文件',
    'Original language': '原语言',
    'File copied: {0}': '文件已复制：{0}',
    'Copied as text ({0}): the file helper is not installed': '已作为文本复制（{0}）：未安装文件助手',
    'Could not copy subtitles': '无法复制字幕',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': '未安装 ASK Video 助手。请运行 native/install.sh',
    'No answer from the helper': '助手没有响应',
    'The helper stopped without an answer': '助手未返回结果就停止了',
    'The helper returned an error': '助手返回了错误',
    'Reload the video tab (it was opened before the extension was installed)': '请刷新视频标签页（它在安装扩展之前就已打开）',
    'The video changed. Reopen the popup': '视频已切换。请重新打开窗口',
    'The page did not respond. Reload the tab': '页面没有响应。请刷新标签页',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'Claude Code 尚未登录。请在终端运行 `claude`，并用 /login 登录',
    'Claude took too long to answer. Try again': 'Claude 回答超时。请重试',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': '找不到 Claude Code（claude）。请先安装，再重新运行 native/install.sh',

    // Subtitle errors from main.js
    'Open a video page': '请打开视频页面',
    'The player has not loaded yet': '播放器尚未加载',
    'The player is not ready': '播放器尚未就绪',
    'The video is still loading (or an ad is playing). Try again in a few seconds': '视频仍在加载（或正在播放广告）。请几秒后重试',
    'This video has no subtitles': '该视频没有字幕',
    'Could not get subtitles from the player. Reload the page and try again': '无法从播放器获取字幕。请刷新页面后重试',
    'No English subtitles, and auto-translation is not available for this video': '没有英文字幕，且该视频不支持自动翻译',
    'Subtitle track not found': '找不到字幕轨道',
    'YouTube did not return subtitles. Reload the page and try again': 'YouTube 没有返回字幕。请刷新页面后重试',
    'The subtitles are empty': '字幕为空',
    'English (auto-translated)': 'English（自动翻译）',
  },
  pt: {
    // Popup
    'Language': 'Idioma',
    'Copy the subtitles as an .srt file': 'Copiar as legendas como arquivo .srt',
    'Copy .srt file': 'Copiar arquivo .srt',
    'Original': 'Original',
    'English': 'Inglês',
    'Also in the right-click menu on YouTube': 'Também no menu do botão direito no YouTube',
    'Summarize it': 'Resuma',
    'Summarize this video.': 'Resuma este vídeo.',
    'Ask anything about this video…': 'Pergunte qualquer coisa sobre este vídeo…',
    'Claude has already watched this video and is ready to answer any question about it!': 'O Claude já assistiu a este vídeo e está pronto para responder a qualquer pergunta!',
    'Claude is thinking': 'Claude está pensando',
    'Jump to this moment': 'Ir para este momento',
    'Could not jump to this moment': 'Não foi possível ir para este momento',
    'Could not get subtitles': 'Não foi possível obter as legendas',
    'Copied as text: the file-copy helper is not installed': 'Copiado como texto: o assistente de cópia de arquivos não está instalado',
    'Open a YouTube video to ask Claude about it.': 'Abra um vídeo do YouTube para perguntar ao Claude.',
    'Reload the video tab (it was opened before the extension was installed).': 'Recarregue a aba do vídeo (ela foi aberta antes da instalação).',
    'auto-translated': 'tradução automática',
    'not available': 'indisponível',

    // Model picker
    'Model': 'Modelo',
    'Auto': 'Auto',

    // Answer length
    'How detailed the answer is': 'Quão detalhada é a resposta',
    'tl;dr': 'tl;dr',
    'normal': 'normal',
    'lecture': 'aula',

    // Claude Code setup instructions
    'Sign in to Claude Code': 'Entre no Claude Code',
    'ASK Video answers through Claude Code on this Mac, but it is not signed in.': 'O ASK Video responde pelo Claude Code neste Mac, mas você não está conectado.',
    'Open the Terminal app.': 'Abra o app Terminal.',
    'Run this command:': 'Execute este comando:',
    'Sign in with your Claude account in the browser that opens.': 'Entre com sua conta do Claude no navegador que abrir.',
    'Come back here and press Check again.': 'Volte aqui e clique em “Verificar de novo”.',
    'Install Claude Code': 'Instale o Claude Code',
    'ASK Video answers through Claude Code, but it was not found on this Mac.': 'O ASK Video responde pelo Claude Code, mas ele não foi encontrado neste Mac.',
    'Install it in Terminal:': 'Instale-o no Terminal:',
    'Sign in:': 'Entre:',
    'Run the helper installer again from the extension folder:': 'Execute de novo o instalador do assistente na pasta da extensão:',
    'Install the ASK Video helper': 'Instale o assistente do ASK Video',
    'The helper connects the extension to Claude Code and copies .srt files.': 'O assistente conecta a extensão ao Claude Code e copia arquivos .srt.',
    'In Terminal, open the extension folder and run:': 'No Terminal, abra a pasta da extensão e execute:',
    'Reload the extension at chrome://extensions.': 'Recarregue a extensão em chrome://extensions.',
    'Could not check Claude Code': 'Não foi possível verificar o Claude Code',
    'Something went wrong while checking Claude Code.': 'Algo deu errado ao verificar o Claude Code.',
    'Make sure it works in Terminal:': 'Verifique se funciona no Terminal:',
    'Click to copy': 'Clique para copiar',
    'Copied': 'Copiado',
    'Check again': 'Verificar de novo',
    'Checking…': 'Verificando…',

    // Context menu and on-page notifications
    'Copy subtitles file': 'Copiar arquivo de legendas',
    'Original language': 'Idioma original',
    'File copied: {0}': 'Arquivo copiado: {0}',
    'Copied as text ({0}): the file helper is not installed': 'Copiado como texto ({0}): o assistente de arquivos não está instalado',
    'Could not copy subtitles': 'Não foi possível copiar as legendas',

    // Background and helper errors
    'The ASK Video helper is not installed. Run native/install.sh': 'O assistente do ASK Video não está instalado. Execute native/install.sh',
    'No answer from the helper': 'O assistente não respondeu',
    'The helper stopped without an answer': 'O assistente parou sem responder',
    'The helper returned an error': 'O assistente retornou um erro',
    'Reload the video tab (it was opened before the extension was installed)': 'Recarregue a aba do vídeo (ela foi aberta antes da instalação)',
    'The video changed. Reopen the popup': 'O vídeo mudou. Abra a janela de novo',
    'The page did not respond. Reload the tab': 'A página não respondeu. Recarregue a aba',
    'Claude Code is not signed in. Run `claude` in Terminal and sign in with /login': 'O Claude Code não está conectado. Execute `claude` no Terminal e entre com /login',
    'Claude took too long to answer. Try again': 'O Claude demorou demais para responder. Tente de novo',
    'Claude Code (claude) was not found. Install it, then run native/install.sh again': 'O Claude Code (claude) não foi encontrado. Instale-o e execute native/install.sh de novo',

    // Subtitle errors from main.js
    'Open a video page': 'Abra a página de um vídeo',
    'The player has not loaded yet': 'O player ainda não carregou',
    'The player is not ready': 'O player não está pronto',
    'The video is still loading (or an ad is playing). Try again in a few seconds': 'O vídeo ainda está carregando (ou há um anúncio). Tente de novo em alguns segundos',
    'This video has no subtitles': 'Este vídeo não tem legendas',
    'Could not get subtitles from the player. Reload the page and try again': 'Não foi possível obter as legendas do player. Recarregue a página e tente de novo',
    'No English subtitles, and auto-translation is not available for this video': 'Não há legendas em inglês e a tradução automática não está disponível para este vídeo',
    'Subtitle track not found': 'Faixa de legendas não encontrada',
    'YouTube did not return subtitles. Reload the page and try again': 'O YouTube não retornou as legendas. Recarregue a página e tente de novo',
    'The subtitles are empty': 'As legendas estão vazias',
    'English (auto-translated)': 'English (tradução automática)',
  },
};

// Messages that start with a fixed English prefix followed by details.
const I18N_PREFIXES = {
  'Claude failed: ': {
    'ru': 'Ошибка Claude: ',
    'de': 'Claude-Fehler: ',
    'fr': 'Erreur de Claude : ',
    'it': 'Errore di Claude: ',
    'es': 'Error de Claude: ',
    'zh': 'Claude 出错：',
    'pt': 'Erro do Claude: '
  }
};

const I18N_LANGS = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'pt', name: 'Português' },
];

let LANG = 'en';

function t(text, ...args) {
  let out = text;
  const dict = I18N[LANG];
  if (dict) {
    if (dict[text] != null) out = dict[text];
    else {
      for (const [en, byLang] of Object.entries(I18N_PREFIXES)) {
        if (byLang[LANG] && text.startsWith(en)) { out = byLang[LANG] + text.slice(en.length); break; }
      }
    }
  }
  args.forEach((a, i) => { out = out.replace(`{${i}}`, a); });
  return out;
}

// The saved choice, or the browser's language if we have it, or English.
async function loadLang() {
  const { lang } = await chrome.storage.local.get('lang');
  const browser = (navigator.language || 'en').toLowerCase().split('-')[0];
  const known = (code) => I18N_LANGS.some((l) => l.code === code);
  LANG = known(lang) ? lang : known(browser) ? browser : 'en';
  return LANG;
}
