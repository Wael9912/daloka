// Arabic / English strings. Arabic is written as instructions, not translations.

export const STRINGS = {
  en: {
    app: 'Daloka', subtitle: 'Sudanese arranger keyboard',
    tapToStart: 'Tap to start audio', midi: 'MIDI', midiNone: 'No keyboard', midiConnect: 'Connect keyboard',
    midiUnsupported: 'This browser has no Web MIDI. Use Chrome on Android with the keyboard on a USB OTG cable.',
    style: 'Style', tempo: 'Tempo', transpose: 'Transpose', split: 'Split', chord: 'Chord',
    intro: 'INTRO', mainA: 'MAIN A', mainB: 'MAIN B', fill: 'FILL', ending: 'ENDING', start: 'START', stop: 'STOP', sync: 'SYNC START',
    upper: 'Upper', lower: 'Lower', layer: 'Layer', lowerOn: 'Lower voice on', chordMode: 'Chords', fingered: 'Fingered', single: 'One finger',
    voices: 'Voices', mixer: 'Mixer', keys: 'Keys', styleVol: 'Style', drumsVol: 'Drums', master: 'Master',
    registrations: 'Setups', save: 'Save', load: 'Load', slot: 'Setup', holdToSave: 'Hold a slot to save the current setup',
    saved: 'Saved to setup', loaded: 'Loaded setup',
    sounds: 'Sounds', importSF2: 'Import SF2 sound bank', removeSF2: 'Remove sound bank', noSF2: 'Built-in sounds (import an .sf2 for real instruments)',
    styles: 'Styles', importStyles: 'Import style pack (.json)', exportStyles: 'Export built-in styles', removeStyles: 'Remove imported styles',
    latency: 'Audio latency', keyboard: 'On-screen keyboard', showKeys: 'Show keys', hideKeys: 'Hide keys',
    language: 'العربية', settings: 'Settings', about: 'About', install: 'Install app', installed: 'Installed',
    aboutText: 'Free, open-source, offline. Plug a USB-MIDI keyboard (YM928 or any other) into the phone with an OTG cable, open this page in Chrome, tap Connect keyboard. Left of the split point plays chords the style follows; right of it plays the upper voice.',
    lintErrors: 'Style pack problems', imported: 'Imported', error: 'Error', bars: 'bar', panic: 'All notes off',
    drumsTrack: 'Drums', percTrack: 'Percussion', bassTrack: 'Bass', chordTrack: 'Chord', padTrack: 'Pad', phraseTrack: 'Phrase', tracks: 'Style tracks',
    waitingChord: 'Play a chord left of the split',
  },
  ar: {
    app: 'دلوكة', subtitle: 'أورغ سوداني مصاحب',
    tapToStart: 'اضغط لتشغيل الصوت', midi: 'MIDI', midiNone: 'لا يوجد كيبورد', midiConnect: 'وصّل الكيبورد',
    midiUnsupported: 'هذا المتصفح لا يدعم Web MIDI. افتح الصفحة في كروم على أندرويد ووصّل الكيبورد بكابل OTG.',
    style: 'الإيقاع', tempo: 'السرعة', transpose: 'نقل الطبقة', split: 'نقطة الفصل', chord: 'الكورد',
    intro: 'مقدمة', mainA: 'أساسي A', mainB: 'أساسي B', fill: 'ضربة', ending: 'خاتمة', start: 'تشغيل', stop: 'إيقاف', sync: 'بدء بالضغط',
    upper: 'اليد اليمنى', lower: 'اليد اليسرى', layer: 'طبقة', lowerOn: 'صوت اليد اليسرى', chordMode: 'الكوردات', fingered: 'بالأصابع', single: 'بإصبع واحد',
    voices: 'الأصوات', mixer: 'الميكسر', keys: 'الكيبورد', styleVol: 'الإيقاع', drumsVol: 'الطبول', master: 'الرئيسي',
    registrations: 'الإعدادات المحفوظة', save: 'حفظ', load: 'تحميل', slot: 'إعداد', holdToSave: 'اضغط مطوّلًا على خانة لحفظ الإعداد الحالي',
    saved: 'تم الحفظ في الخانة', loaded: 'تم تحميل الخانة',
    sounds: 'بنوك الصوت', importSF2: 'استيراد بنك صوت SF2', removeSF2: 'إزالة بنك الصوت', noSF2: 'أصوات مدمجة (استورد ملف .sf2 لآلات حقيقية)',
    styles: 'الإيقاعات', importStyles: 'استيراد حزمة إيقاعات (.json)', exportStyles: 'تصدير الإيقاعات المدمجة', removeStyles: 'إزالة الإيقاعات المستوردة',
    latency: 'تأخير الصوت', keyboard: 'كيبورد على الشاشة', showKeys: 'أظهر المفاتيح', hideKeys: 'أخفِ المفاتيح',
    language: 'English', settings: 'الإعدادات', about: 'عن التطبيق', install: 'ثبّت التطبيق', installed: 'مثبّت',
    aboutText: 'مجاني ومفتوح المصدر ويعمل بلا إنترنت. وصّل كيبورد USB-MIDI (مثل YM928) بالهاتف عبر كابل OTG، افتح الصفحة في كروم، ثم اضغط «وصّل الكيبورد». يسار نقطة الفصل يعزف الكوردات التي يتبعها الإيقاع، ويمينها يعزف الصوت الرئيسي.',
    lintErrors: 'مشاكل في حزمة الإيقاعات', imported: 'تم الاستيراد', error: 'خطأ', bars: 'بار', panic: 'إسكات كل النغمات',
    drumsTrack: 'طبول', percTrack: 'إيقاعات', bassTrack: 'باص', chordTrack: 'كورد', padTrack: 'خلفية', phraseTrack: 'جملة', tracks: 'مسارات الإيقاع',
    waitingChord: 'اعزف كوردًا يسار نقطة الفصل',
  },
};

export function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}
