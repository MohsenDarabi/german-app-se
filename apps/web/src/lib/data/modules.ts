export interface LessonStub {
  id: string;
  title: string;
  description: string;
  path: string; // URL path
}

export interface ModuleStub {
  id: string;
  title: string;
  level: string;
  lessons: LessonStub[];
}

// German (de-fa) modules
const DE_FA_A1_MODULES: ModuleStub[] = [
  {
    id: "module-01",
    title: "بخش ۱: شروع سفر (Basics)",
    level: "A1",
    lessons: [
      {
        id: "A1-M01-L01",
        title: "سلام و خداحافظی (Hallo und Tschüss)",
        description: "یاد بگیرید چطور سلام و خداحافظی کنید و خود را معرفی کنید.",
        path: "/learn/de-fa/A1/A1-M01-L01"
      },
      {
        id: "A1-M01-L02",
        title: "حالت چطوره؟ (Wie geht's?)",
        description: "یاد بگیرید چطور از حال کسی بپرسید و به آن پاسخ دهید.",
        path: "/learn/de-fa/A1/A1-M01-L02"
      },
      {
        id: "A1-M01-L03",
        title: "اهل کجایی؟ (Woher kommst du?)",
        description: "یاد بگیرید چطور از کشور مبدأ و محل زندگی بپرسید و پاسخ دهید.",
        path: "/learn/de-fa/A1/A1-M01-L03"
      },
      {
        id: "A1-M01-L04",
        title: "من آلمانی صحبت می‌کنم! (Ich spreche Deutsch!)",
        description: "یاد بگیرید چطور درباره زبان‌هایی که صحبت می‌کنید و یاد می‌گیرید صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M01-L04"
      },
      {
        id: "A1-M01-L05",
        title: "اسمت چیه؟ (Wie heißt du?)",
        description: "یاد بگیرید چطور اسم بپرسید و خودتان را معرفی کنید.",
        path: "/learn/de-fa/A1/A1-M01-L05"
      },
      {
        id: "A1-M01-L06",
        title: "کجا زندگی می‌کنی؟ (Wo wohnst du?)",
        description: "یاد بگیرید چطور درباره محل زندگی صحبت کنید و تفاوت aus و in را بدانید.",
        path: "/learn/de-fa/A1/A1-M01-L06"
      },
      {
        id: "A1-M01-L07",
        title: "اعداد ۱ تا ۱۰ (Zahlen 1-10)",
        description: "یاد بگیرید اعداد ۱ تا ۱۰ را به آلمانی بشمارید.",
        path: "/learn/de-fa/A1/A1-M01-L07"
      },
      {
        id: "A1-M01-L08",
        title: "اعداد ۱۱ تا ۲۰ (Zahlen 11-20)",
        description: "یاد بگیرید اعداد ۱۱ تا ۲۰ را به آلمانی بشمارید.",
        path: "/learn/de-fa/A1/A1-M01-L08"
      },
      {
        id: "A1-M01-L09",
        title: "اعداد ۲۱ تا ۱۰۰ (Zahlen 21-100)",
        description: "یاد بگیرید اعداد ۲۱ تا ۱۰۰ را به آلمانی بشمارید.",
        path: "/learn/de-fa/A1/A1-M01-L09"
      },
      {
        id: "A1-M01-L10",
        title: "شماره تلفن (Telefonnummern)",
        description: "یاد بگیرید چطور شماره تلفن بپرسید و بگویید.",
        path: "/learn/de-fa/A1/A1-M01-L10"
      }
    ]
  },
  {
    id: "module-02",
    title: "بخش ۲: فعل‌ها (Verben)",
    level: "A1",
    lessons: [
      {
        id: "A1-M02-L01",
        title: "بودن و داشتن (sein und haben)",
        description: "دو فعل مهم آلمانی را یاد بگیرید: sein (بودن) و haben (داشتن).",
        path: "/learn/de-fa/A1/A1-M02-L01"
      },
      {
        id: "A1-M02-L02",
        title: "فعل‌های باقاعده (Regelmäßige Verben)",
        description: "یاد بگیرید چطور فعل‌های باقاعده آلمانی را صرف کنید.",
        path: "/learn/de-fa/A1/A1-M02-L02"
      },
      {
        id: "A1-M02-L03",
        title: "ما، شما، آن‌ها (Wir, ihr, sie)",
        description: "صرف فعل با ضمایر جمع: wir (ما)، ihr (شما)، sie (آن‌ها) و Sie (شما محترم).",
        path: "/learn/de-fa/A1/A1-M02-L03"
      },
      {
        id: "A1-M02-L04",
        title: "فعل‌های خاص (Besondere Verben)",
        description: "یاد بگیرید فعل‌هایی که ریشه‌شان تغییر می‌کند: essen, lesen, schlafen, fahren",
        path: "/learn/de-fa/A1/A1-M02-L04"
      },
      {
        id: "A1-M02-L05",
        title: "فعل‌های کمکی (Modalverben)",
        description: "یاد بگیرید چگونه بگویید «می‌توانم»، «می‌خواهم» و «باید»: können, wollen, müssen",
        path: "/learn/de-fa/A1/A1-M02-L05"
      }
    ]
  },
  {
    id: "module-03",
    title: "بخش ۳: منفی کردن (Verneinung)",
    level: "A1",
    lessons: [
      {
        id: "A1-M03-L01",
        title: "نه / نمی (nicht)",
        description: "یاد بگیرید چطور جملات منفی بسازید با کلمه nicht",
        path: "/learn/de-fa/A1/A1-M03-L01"
      },
      {
        id: "A1-M03-L02",
        title: "هیچ / ندارم (kein/keine)",
        description: "یاد بگیرید چطور اسم‌ها را منفی کنید با kein و keine",
        path: "/learn/de-fa/A1/A1-M03-L02"
      },
      {
        id: "A1-M03-L03",
        title: "نه، ممنون! (Nein, danke!)",
        description: "یاد بگیرید چطور مودبانه رد کنید و عذرخواهی کنید",
        path: "/learn/de-fa/A1/A1-M03-L03"
      },
      {
        id: "A1-M03-L04",
        title: "تضادها (Kontraste)",
        description: "یاد بگیرید چطور با sondern، noch، schon و immer تضاد و تأکید بسازید",
        path: "/learn/de-fa/A1/A1-M03-L04"
      }
    ]
  },
  {
    id: "module-04",
    title: "بخش ۴: حروف تعریف (Artikel)",
    level: "A1",
    lessons: [
      {
        id: "A1-M04-L01",
        title: "حروف تعریف (der, die, das)",
        description: "یاد بگیرید سه جنس آلمانی را: مذکر (der)، مونث (die) و خنثی (das)",
        path: "/learn/de-fa/A1/A1-M04-L01"
      },
      {
        id: "A1-M04-L02",
        title: "یک چیزی (ein, eine)",
        description: "یاد بگیرید چطور بگویید «یک» در آلمانی: ein برای مذکر و خنثی، eine برای مونث",
        path: "/learn/de-fa/A1/A1-M04-L02"
      },
      {
        id: "A1-M04-L03",
        title: "جمع در آلمانی (Plural)",
        description: "یاد بگیرید چطور اسم‌های جمع در آلمانی ساخته می‌شوند و همه جمع‌ها die می‌گیرند",
        path: "/learn/de-fa/A1/A1-M04-L03"
      },
      {
        id: "A1-M04-L04",
        title: "حالت مفعولی (Akkusativ)",
        description: "یاد بگیرید که در حالت مفعولی، فقط مذکر تغییر می‌کند: der/ein → den/einen",
        path: "/learn/de-fa/A1/A1-M04-L04"
      }
    ]
  },
  {
    id: "module-05",
    title: "بخش ۵: سوالات (Fragen)",
    level: "A1",
    lessons: [
      {
        id: "A1-M05-L01",
        title: "بله یا خیر؟ (Ja oder Nein?)",
        description: "یاد بگیرید چطور سوالات بله/خیر بسازید: فعل را اول جمله بیاورید!",
        path: "/learn/de-fa/A1/A1-M05-L01"
      },
      {
        id: "A1-M05-L02",
        title: "کی؟ چی؟ کجا؟ (Wer? Was? Wo?)",
        description: "یاد بگیرید سوالات با کلمات پرسشی W بسازید: Wer، Was، Wo، Woher، Wohin",
        path: "/learn/de-fa/A1/A1-M05-L02"
      },
      {
        id: "A1-M05-L03",
        title: "کی؟ چطور؟ (Wann? Wie?)",
        description: "یاد بگیرید سوالات درباره زمان و چگونگی بپرسید: Wann، Wie، Wie viel، Wie lange",
        path: "/learn/de-fa/A1/A1-M05-L03"
      },
      {
        id: "A1-M05-L04",
        title: "چرا؟ کدام؟ (Warum? Welche?)",
        description: "یاد بگیرید سوالات درباره دلیل و انتخاب بپرسید: Warum، Welcher، Welche، Welches",
        path: "/learn/de-fa/A1/A1-M05-L04"
      }
    ]
  },
  {
    id: "module-06",
    title: "بخش ۶: زمان (Zeit)",
    level: "A1",
    lessons: [
      {
        id: "A1-M06-L01",
        title: "ساعت چنده؟ (Wie spät ist es?)",
        description: "یاد بگیرید چطور ساعت را به آلمانی بگویید و بپرسید.",
        path: "/learn/de-fa/A1/A1-M06-L01"
      },
      {
        id: "A1-M06-L02",
        title: "روزهای هفته (Wochentage)",
        description: "یاد بگیرید روزهای هفته را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M06-L02"
      },
      {
        id: "A1-M06-L03",
        title: "ماه‌ها و فصل‌ها (Monate und Jahreszeiten)",
        description: "یاد بگیرید ماه‌ها و فصل‌های سال را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M06-L03"
      },
      {
        id: "A1-M06-L04",
        title: "برنامه روزانه (Tagesablauf)",
        description: "یاد بگیرید درباره برنامه روزانه‌تان صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M06-L04"
      }
    ]
  },
  {
    id: "module-07",
    title: "بخش ۷: خانواده (Familie)",
    level: "A1",
    lessons: [
      {
        id: "A1-M07-L01",
        title: "خانواده‌ام (Meine Familie)",
        description: "یاد بگیرید اعضای خانواده را به آلمانی بگویید: مادر، پدر، خواهر، برادر",
        path: "/learn/de-fa/A1/A1-M07-L01"
      },
      {
        id: "A1-M07-L02",
        title: "پدربزرگ و مادربزرگ (Großeltern)",
        description: "یاد بگیرید کلمات پدربزرگ، مادربزرگ و نوه را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M07-L02"
      },
      {
        id: "A1-M07-L03",
        title: "خویشاوندان (Verwandte)",
        description: "یاد بگیرید کلمات عمو، خاله، پسرعمو و دیگر خویشاوندان را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M07-L03"
      },
      {
        id: "A1-M07-L04",
        title: "عکس خانوادگی (Das Familienfoto)",
        description: "یاد بگیرید چطور عکس خانوادگی را توصیف کنید و از sein/ihr استفاده کنید.",
        path: "/learn/de-fa/A1/A1-M07-L04"
      }
    ]
  },
  {
    id: "module-08",
    title: "بخش ۸: غذا و نوشیدنی (Essen und Trinken)",
    level: "A1",
    lessons: [
      {
        id: "A1-M08-L01",
        title: "خوردن و نوشیدن (Essen und Trinken)",
        description: "یاد بگیرید غذاها و نوشیدنی‌های پایه را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M08-L01"
      },
      {
        id: "A1-M08-L02",
        title: "میوه و سبزیجات (Obst und Gemüse)",
        description: "یاد بگیرید میوه‌ها و سبزیجات را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M08-L02"
      },
      {
        id: "A1-M08-L03",
        title: "در رستوران (Im Restaurant)",
        description: "یاد بگیرید چطور در رستوران آلمانی سفارش بدهید.",
        path: "/learn/de-fa/A1/A1-M08-L03"
      },
      {
        id: "A1-M08-L04",
        title: "خرید کردن (Einkaufen)",
        description: "یاد بگیرید چطور در سوپرمارکت آلمانی خرید کنید.",
        path: "/learn/de-fa/A1/A1-M08-L04"
      }
    ]
  },
  {
    id: "module-09",
    title: "بخش ۹: مسکن (Wohnen)",
    level: "A1",
    lessons: [
      {
        id: "A1-M09-L01",
        title: "آپارتمان (Die Wohnung)",
        description: "یاد بگیرید اتاق‌های خانه را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M09-L01"
      },
      {
        id: "A1-M09-L02",
        title: "مبلمان (Möbel)",
        description: "یاد بگیرید وسایل خانه و مبلمان را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M09-L02"
      },
      {
        id: "A1-M09-L03",
        title: "آپارتمان من (Meine Wohnung)",
        description: "یاد بگیرید چطور آپارتمان‌تان را توصیف کنید: صفات و حروف اضافه مکان.",
        path: "/learn/de-fa/A1/A1-M09-L03"
      },
      {
        id: "A1-M09-L04",
        title: "جستجوی آپارتمان (Wohnungssuche)",
        description: "یاد بگیرید چطور آپارتمان پیدا کنید و درباره اجاره صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M09-L04"
      }
    ]
  },
  {
    id: "module-10",
    title: "بخش ۱۰: سرگرمی‌ها (Hobbys und Freizeit)",
    level: "A1",
    lessons: [
      {
        id: "A1-M10-L01",
        title: "سرگرمی‌ها (Hobbys)",
        description: "یاد بگیرید درباره سرگرمی‌های خود به آلمانی صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M10-L01"
      },
      {
        id: "A1-M10-L02",
        title: "ورزش (Sport)",
        description: "یاد بگیرید درباره ورزش‌ها به آلمانی صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M10-L02"
      },
      {
        id: "A1-M10-L03",
        title: "اوقات فراغت (Freizeit)",
        description: "یاد بگیرید درباره فعالیت‌های اوقات فراغت به آلمانی صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M10-L03"
      },
      {
        id: "A1-M10-L04",
        title: "چه کاری دوست داری؟ (Was machst du gern?)",
        description: "یاد بگیرید درباره ترجیحات صحبت کنید و پیشنهاد بدهید.",
        path: "/learn/de-fa/A1/A1-M10-L04"
      }
    ]
  },
  {
    id: "module-11",
    title: "بخش ۱۱: لباس و رنگ‌ها (Kleidung und Farben)",
    level: "A1",
    lessons: [
      {
        id: "A1-M11-L01",
        title: "لباس (Kleidung)",
        description: "یاد بگیرید نام لباس‌ها را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M11-L01"
      },
      {
        id: "A1-M11-L02",
        title: "رنگ‌ها (Farben)",
        description: "یاد بگیرید رنگ‌ها را به آلمانی بگویید.",
        path: "/learn/de-fa/A1/A1-M11-L02"
      },
      {
        id: "A1-M11-L03",
        title: "چه رنگی دارد؟ (Welche Farbe hat...?)",
        description: "یاد بگیرید لباس‌ها را با رنگ توصیف کنید.",
        path: "/learn/de-fa/A1/A1-M11-L03"
      },
      {
        id: "A1-M11-L04",
        title: "در فروشگاه لباس (Im Kleidungsgeschäft)",
        description: "یاد بگیرید چطور در فروشگاه لباس آلمانی خرید کنید.",
        path: "/learn/de-fa/A1/A1-M11-L04"
      }
    ]
  },
  {
    id: "module-12",
    title: "بخش ۱۲: فعل‌های جداشدنی (Trennbare Verben)",
    level: "A1",
    lessons: [
      {
        id: "A1-M12-L01",
        title: "فعل‌های جداشدنی (Trennbare Verben)",
        description: "یاد بگیرید چطور فعل‌های جداشدنی آلمانی کار می‌کنند.",
        path: "/learn/de-fa/A1/A1-M12-L01"
      },
      {
        id: "A1-M12-L02",
        title: "زندگی روزمره (Alltag)",
        description: "یاد بگیرید فعل‌های جداشدنی روزمره مثل einkaufen و fernsehen.",
        path: "/learn/de-fa/A1/A1-M12-L02"
      },
      {
        id: "A1-M12-L03",
        title: "برنامه روزانه (Tagesablauf)",
        description: "یاد بگیرید درباره برنامه روزانه‌تان با فعل‌های جداشدنی صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M12-L03"
      },
      {
        id: "A1-M12-L04",
        title: "روز من (Mein Tag)",
        description: "یاد بگیرید با کلمات ترتیبی روزتان را توصیف کنید.",
        path: "/learn/de-fa/A1/A1-M12-L04"
      }
    ]
  },
  {
    id: "module-13",
    title: "بخش ۱۳: فعل‌های وجهی (Modalverben)",
    level: "A1",
    lessons: [
      {
        id: "A1-M13-L01",
        title: "می‌توانم! (können)",
        description: "یاد بگیرید چطور بگویید چه کارهایی می‌توانید انجام دهید.",
        path: "/learn/de-fa/A1/A1-M13-L01"
      },
      {
        id: "A1-M13-L02",
        title: "باید و خواستن (müssen und wollen)",
        description: "یاد بگیرید چطور بگویید چه کارهایی باید انجام دهید یا می‌خواهید.",
        path: "/learn/de-fa/A1/A1-M13-L02"
      },
      {
        id: "A1-M13-L03",
        title: "اجازه (dürfen)",
        description: "یاد بگیرید چطور درباره اجازه و ممنوعیت صحبت کنید.",
        path: "/learn/de-fa/A1/A1-M13-L03"
      },
      {
        id: "A1-M13-L04",
        title: "دوست داشتن (mögen und möchten)",
        description: "یاد بگیرید چطور بگویید چه چیزهایی دوست دارید و چه می‌خواهید.",
        path: "/learn/de-fa/A1/A1-M13-L04"
      }
    ]
  },
  {
    id: "module-14",
    title: "بخش ۱۴: مسیریابی (Wegbeschreibung)",
    level: "A1",
    lessons: [
      {
        id: "A1-M14-L01",
        title: "کجاست؟ (Wo ist...?)",
        description: "یاد بگیرید چطور آدرس بپرسید و مسیر را توضیح دهید.",
        path: "/learn/de-fa/A1/A1-M14-L01"
      }
    ]
  }
];

const DE_FA_A2_MODULES: ModuleStub[] = [
  {
    id: "module-01",
    title: "بخش ۱: زمان گذشته (Perfekt)",
    level: "A2",
    lessons: [
      {
        id: "A2-M01-L01",
        title: "Perfekt با haben",
        description: "یاد بگیرید چطور درباره کارهایی که انجام دادید صحبت کنید.",
        path: "/learn/de-fa/A2/A2-M01-L01"
      },
      {
        id: "A2-M01-L02",
        title: "Perfekt با sein",
        description: "یاد بگیرید چطور درباره حرکت و سفر در گذشته صحبت کنید.",
        path: "/learn/de-fa/A2/A2-M01-L02"
      },
      {
        id: "A2-M01-L03",
        title: "Partizip II بی‌قاعده",
        description: "یاد بگیرید Partizip II فعل‌های بی‌قاعده را.",
        path: "/learn/de-fa/A2/A2-M01-L03"
      },
      {
        id: "A2-M01-L04",
        title: "Perfekt - جمع‌بندی",
        description: "تمرین ترکیبی زمان گذشته با haben و sein.",
        path: "/learn/de-fa/A2/A2-M01-L04"
      }
    ]
  }
];

// English (en-fa) modules
const EN_FA_A1_MODULES: ModuleStub[] = [
  {
    id: "module-01",
    title: "بخش ۱: شروع سفر (Getting Started)",
    level: "A1",
    lessons: [
      {
        id: "A1-M01-L01",
        title: "سلام و خداحافظی (Hello and Goodbye)",
        description: "یاد بگیرید چطور به انگلیسی سلام و خداحافظی کنید.",
        path: "/learn/en-fa/A1/A1-M01-L01"
      }
    ]
  }
];

const EN_FA_A2_MODULES: ModuleStub[] = [];

// Module data registry by language pair
const MODULE_DATA: Record<string, { A1: ModuleStub[]; A2: ModuleStub[] }> = {
  'de-fa': {
    A1: DE_FA_A1_MODULES,
    A2: DE_FA_A2_MODULES,
  },
  'en-fa': {
    A1: EN_FA_A1_MODULES,
    A2: EN_FA_A2_MODULES,
  },
};

/**
 * Get all modules for a specific language pair
 */
export function getAllModulesForLanguage(languagePair: string): { A1: ModuleStub[]; A2: ModuleStub[] } {
  return MODULE_DATA[languagePair] || { A1: [], A2: [] };
}

/**
 * Get modules for a specific language pair and level
 */
export function getModulesForLevel(languagePair: string, level: 'A1' | 'A2'): ModuleStub[] {
  return MODULE_DATA[languagePair]?.[level] || [];
}

// Backward compatibility exports (for existing code that imports these directly)
export const A1_MODULES = DE_FA_A1_MODULES;
export const A2_MODULES = DE_FA_A2_MODULES;
