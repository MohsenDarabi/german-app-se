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
  },
  {
    id: "module-02",
    title: "بخش ۲: مقایسه (Vergleiche)",
    level: "A2",
    lessons: [
      {
        id: "A2-M02-L01",
        title: "صفت تفضیلی (Komparativ)",
        description: "یاد بگیرید چطور چیزها را با هم مقایسه کنید.",
        path: "/learn/de-fa/A2/A2-M02-L01"
      },
      {
        id: "A2-M02-L02",
        title: "صفت عالی (Superlativ)",
        description: "یاد بگیرید چطور بگویید چیزی بهترین یا بیشترین است.",
        path: "/learn/de-fa/A2/A2-M02-L02"
      },
      {
        id: "A2-M02-L03",
        title: "برابری (so...wie)",
        description: "یاد بگیرید چطور بگویید دو چیز مثل هم هستند.",
        path: "/learn/de-fa/A2/A2-M02-L03"
      },
      {
        id: "A2-M02-L04",
        title: "مقایسه - جمع‌بندی",
        description: "تمرین ترکیبی همه انواع مقایسه.",
        path: "/learn/de-fa/A2/A2-M02-L04"
      }
    ]
  },
  {
    id: "module-03",
    title: "بخش ۳: فعل‌های انعکاسی (Reflexivverben)",
    level: "A2",
    lessons: [
      {
        id: "A2-M03-L01",
        title: "sich waschen - خود را شستن",
        description: "یاد بگیرید فعل‌هایی که با sich می‌آیند و ضمایر انعکاسی.",
        path: "/learn/de-fa/A2/A2-M03-L01"
      },
      {
        id: "A2-M03-L02",
        title: "Gefühle - احساسات",
        description: "یاد بگیرید چطور درباره احساسات با فعل‌های انعکاسی صحبت کنید.",
        path: "/learn/de-fa/A2/A2-M03-L02"
      },
      {
        id: "A2-M03-L03",
        title: "mit Präpositionen - با حروف اضافه",
        description: "یاد بگیرید فعل‌های انعکاسی که با حروف اضافه خاص می‌آیند.",
        path: "/learn/de-fa/A2/A2-M03-L03"
      },
      {
        id: "A2-M03-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی فعل‌های انعکاسی و ضمایر Dativ.",
        path: "/learn/de-fa/A2/A2-M03-L04"
      }
    ]
  },
  {
    id: "module-04",
    title: "بخش ۴: جملات پیرو (Nebensätze)",
    level: "A2",
    lessons: [
      {
        id: "A2-M04-L01",
        title: "weil und dass - چون و که",
        description: "یاد بگیرید جملات پیرو با weil و dass بسازید.",
        path: "/learn/de-fa/A2/A2-M04-L01"
      },
      {
        id: "A2-M04-L02",
        title: "wenn - اگر / وقتی",
        description: "یاد بگیرید جملات شرطی و زمانی با wenn بسازید.",
        path: "/learn/de-fa/A2/A2-M04-L02"
      },
      {
        id: "A2-M04-L03",
        title: "bevor, nachdem, obwohl",
        description: "یاد بگیرید جملات زمانی و امتیازی بسازید.",
        path: "/learn/de-fa/A2/A2-M04-L03"
      },
      {
        id: "A2-M04-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه حروف ربط پیرو.",
        path: "/learn/de-fa/A2/A2-M04-L04"
      }
    ]
  },
  {
    id: "module-05",
    title: "بخش ۵: گذشته ساده (Präteritum)",
    level: "A2",
    lessons: [
      {
        id: "A2-M05-L01",
        title: "sein und haben",
        description: "یاد بگیرید گذشته ساده sein و haben را.",
        path: "/learn/de-fa/A2/A2-M05-L01"
      },
      {
        id: "A2-M05-L02",
        title: "Modalverben - فعل‌های وجهی",
        description: "یاد بگیرید گذشته ساده فعل‌های وجهی را.",
        path: "/learn/de-fa/A2/A2-M05-L02"
      },
      {
        id: "A2-M05-L03",
        title: "regelmäßige Verben - فعل‌های باقاعده",
        description: "یاد بگیرید گذشته ساده فعل‌های باقاعده را.",
        path: "/learn/de-fa/A2/A2-M05-L03"
      },
      {
        id: "A2-M05-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی گذشته ساده با فعل‌های بی‌قاعده.",
        path: "/learn/de-fa/A2/A2-M05-L04"
      }
    ]
  },
  {
    id: "module-06",
    title: "بخش ۶: شرطی (Konjunktiv II)",
    level: "A2",
    lessons: [
      {
        id: "A2-M06-L01",
        title: "würde + Infinitiv",
        description: "یاد بگیرید چطور با würde آرزوها و درخواست‌های مودبانه بیان کنید.",
        path: "/learn/de-fa/A2/A2-M06-L01"
      },
      {
        id: "A2-M06-L02",
        title: "hätte und wäre",
        description: "یاد بگیرید فرم شرطی haben و sein را برای آرزوها و موقعیت‌های فرضی.",
        path: "/learn/de-fa/A2/A2-M06-L02"
      },
      {
        id: "A2-M06-L03",
        title: "Modalverben - فعل‌های وجهی",
        description: "یاد بگیرید فرم شرطی فعل‌های وجهی را: könnte, müsste, sollte, dürfte.",
        path: "/learn/de-fa/A2/A2-M06-L03"
      },
      {
        id: "A2-M06-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه فرم‌های Konjunktiv II.",
        path: "/learn/de-fa/A2/A2-M06-L04"
      }
    ]
  },
  {
    id: "module-07",
    title: "بخش ۷: جملات موصولی (Relativsätze)",
    level: "A2",
    lessons: [
      {
        id: "A2-M07-L01",
        title: "Nominativ - فاعلی",
        description: "یاد بگیرید جملات موصولی بسازید با der, die, das به عنوان فاعل.",
        path: "/learn/de-fa/A2/A2-M07-L01"
      },
      {
        id: "A2-M07-L02",
        title: "Akkusativ - مفعولی",
        description: "یاد بگیرید جملات موصولی بسازید با den, die, das به عنوان مفعول.",
        path: "/learn/de-fa/A2/A2-M07-L02"
      },
      {
        id: "A2-M07-L03",
        title: "Dativ - متممی",
        description: "یاد بگیرید جملات موصولی بسازید با dem, der, denen به عنوان متمم.",
        path: "/learn/de-fa/A2/A2-M07-L03"
      },
      {
        id: "A2-M07-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه ضمایر موصولی در Nominativ, Akkusativ و Dativ.",
        path: "/learn/de-fa/A2/A2-M07-L04"
      }
    ]
  },
  {
    id: "module-08",
    title: "بخش ۸: مجهول (Passiv)",
    level: "A2",
    lessons: [
      {
        id: "A2-M08-L01",
        title: "Passiv Präsens - مجهول زمان حال",
        description: "یاد بگیرید چطور جملات مجهول بسازید با werden + Partizip II.",
        path: "/learn/de-fa/A2/A2-M08-L01"
      },
      {
        id: "A2-M08-L02",
        title: "Passiv mit Modalverben - مجهول با فعل‌های وجهی",
        description: "یاد بگیرید چطور مجهول را با können, müssen, sollen ترکیب کنید.",
        path: "/learn/de-fa/A2/A2-M08-L02"
      },
      {
        id: "A2-M08-L03",
        title: "Passiv Perfekt - مجهول زمان گذشته",
        description: "یاد بگیرید چطور بگویید کاری انجام شده است با sein + Partizip II + worden.",
        path: "/learn/de-fa/A2/A2-M08-L03"
      },
      {
        id: "A2-M08-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه فرم‌های مجهول: Präsens, Perfekt و با Modalverben.",
        path: "/learn/de-fa/A2/A2-M08-L04"
      }
    ]
  },
  {
    id: "module-09",
    title: "بخش ۹: صرف صفت (Adjektivdeklination)",
    level: "A2",
    lessons: [
      {
        id: "A2-M09-L01",
        title: "Mit bestimmtem Artikel - با حرف تعریف معرفه",
        description: "یاد بگیرید چطور صفات با der, die, das تغییر می‌کنند.",
        path: "/learn/de-fa/A2/A2-M09-L01"
      },
      {
        id: "A2-M09-L02",
        title: "Mit unbestimmtem Artikel - با حرف تعریف نکره",
        description: "یاد بگیرید چطور صفات با ein, eine تغییر می‌کنند.",
        path: "/learn/de-fa/A2/A2-M09-L02"
      },
      {
        id: "A2-M09-L03",
        title: "Ohne Artikel - بدون حرف تعریف",
        description: "یاد بگیرید چطور صفات بدون حرف تعریف تغییر می‌کنند.",
        path: "/learn/de-fa/A2/A2-M09-L03"
      },
      {
        id: "A2-M09-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه پایانه‌های صفت: با der/die/das، با ein/eine و بدون حرف تعریف.",
        path: "/learn/de-fa/A2/A2-M09-L04"
      }
    ]
  },
  {
    id: "module-10",
    title: "بخش ۱۰: مقایسه پیشرفته (Komparativ und Superlativ)",
    level: "A2",
    lessons: [
      {
        id: "A2-M10-L01",
        title: "Komparativ - صفت تفضیلی",
        description: "یاد بگیرید چطور چیزها را با صفت تفضیلی مقایسه کنید: größer، besser، schneller.",
        path: "/learn/de-fa/A2/A2-M10-L01"
      },
      {
        id: "A2-M10-L02",
        title: "Superlativ - صفت عالی",
        description: "یاد بگیرید چطور بگویید چیزی بهترین یا بیشترین است: am besten، am größten.",
        path: "/learn/de-fa/A2/A2-M10-L02"
      },
      {
        id: "A2-M10-L03",
        title: "Gleichheit - برابری",
        description: "یاد بگیرید چطور بگویید دو چیز مثل هم هستند: so...wie، genauso...wie.",
        path: "/learn/de-fa/A2/A2-M10-L03"
      },
      {
        id: "A2-M10-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه انواع مقایسه: تفضیلی، عالی و برابری.",
        path: "/learn/de-fa/A2/A2-M10-L04"
      }
    ]
  },
  {
    id: "module-11",
    title: "بخش ۱۱: زمان آینده (Futur)",
    level: "A2",
    lessons: [
      {
        id: "A2-M11-L01",
        title: "Futur I - زمان آینده",
        description: "یاد بگیرید چطور با werden درباره آینده صحبت کنید.",
        path: "/learn/de-fa/A2/A2-M11-L01"
      },
      {
        id: "A2-M11-L02",
        title: "Pläne und Vorhersagen - برنامه‌ها و پیش‌بینی‌ها",
        description: "یاد بگیرید چطور برنامه‌ها و پیش‌بینی‌ها را با Futur I بیان کنید.",
        path: "/learn/de-fa/A2/A2-M11-L02"
      },
      {
        id: "A2-M11-L03",
        title: "Futur I oder Präsens? - آینده یا حال؟",
        description: "یاد بگیرید چه وقت از Futur I و چه وقت از Präsens برای آینده استفاده کنید.",
        path: "/learn/de-fa/A2/A2-M11-L03"
      },
      {
        id: "A2-M11-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه مباحث Futur I: ساختار werden، برنامه‌ها، پیش‌بینی‌ها و حدس‌ها.",
        path: "/learn/de-fa/A2/A2-M11-L04"
      }
    ]
  },
  {
    id: "module-12",
    title: "بخش ۱۲: مصدر با zu (Infinitiv mit zu)",
    level: "A2",
    lessons: [
      {
        id: "A2-M12-L01",
        title: "Infinitiv mit zu - مصدر با zu",
        description: "یاد بگیرید چطور از zu + Infinitiv با فعل‌هایی مثل versuchen، beginnen و vergessen استفاده کنید.",
        path: "/learn/de-fa/A2/A2-M12-L01"
      },
      {
        id: "A2-M12-L02",
        title: "Verben mit zu + Infinitiv - فعل‌ها با zu",
        description: "فعل‌های بیشتر با zu + Infinitiv: hoffen، planen، erlauben، verbieten، empfehlen، bitten.",
        path: "/learn/de-fa/A2/A2-M12-L02"
      },
      {
        id: "A2-M12-L03",
        title: "um...zu, ohne...zu, anstatt...zu",
        description: "یاد بگیرید چطور هدف، نبود عمل و جایگزینی را با zu + Infinitiv بیان کنید.",
        path: "/learn/de-fa/A2/A2-M12-L03"
      },
      {
        id: "A2-M12-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه مباحث zu + Infinitiv: فعل‌ها، um...zu، ohne...zu، anstatt...zu.",
        path: "/learn/de-fa/A2/A2-M12-L04"
      }
    ]
  },
  {
    id: "module-13",
    title: "بخش ۱۳: کلمات ربط (Konnektoren)",
    level: "A2",
    lessons: [
      {
        id: "A2-M13-L01",
        title: "deshalb, deswegen, darum - به همین دلیل",
        description: "یاد بگیرید چطور نتیجه و دلیل را با کلمات ربط بیان کنید.",
        path: "/learn/de-fa/A2/A2-M13-L01"
      },
      {
        id: "A2-M13-L02",
        title: "trotzdem, dennoch - با این حال",
        description: "یاد بگیرید چطور تضاد و استثنا را با کلمات ربط بیان کنید.",
        path: "/learn/de-fa/A2/A2-M13-L02"
      },
      {
        id: "A2-M13-L03",
        title: "außerdem, sonst, also - علاوه بر این، وگرنه، پس",
        description: "یاد بگیرید چطور اضافه کردن، هشدار و نتیجه‌گیری را با کلمات ربط بیان کنید.",
        path: "/learn/de-fa/A2/A2-M13-L03"
      },
      {
        id: "A2-M13-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور همه کلمات ربط: deshalb، trotzdem، außerdem، sonst، also و بیشتر.",
        path: "/learn/de-fa/A2/A2-M13-L04"
      }
    ]
  },
  {
    id: "module-14",
    title: "بخش ۱۴: حروف اضافه (Präpositionen)",
    level: "A2",
    lessons: [
      {
        id: "A2-M14-L01",
        title: "Wechselpräpositionen - حروف اضافه دوگانه",
        description: "یاد بگیرید حروف اضافه‌ای که هم با Akkusativ و هم با Dativ می‌آیند.",
        path: "/learn/de-fa/A2/A2-M14-L01"
      },
      {
        id: "A2-M14-L02",
        title: "Temporale Präpositionen - حروف اضافه زمانی",
        description: "یاد بگیرید حروف اضافه زمانی: vor، nach، seit، bis، während، ab.",
        path: "/learn/de-fa/A2/A2-M14-L02"
      },
      {
        id: "A2-M14-L03",
        title: "Verben mit Präpositionen - فعل‌ها با حروف اضافه",
        description: "یاد بگیرید فعل‌هایی که با حروف اضافه خاص می‌آیند: warten auf، denken an، sich freuen über.",
        path: "/learn/de-fa/A2/A2-M14-L03"
      },
      {
        id: "A2-M14-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور همه حروف اضافه: Wechselpräpositionen، زمانی و فعل‌ها با حروف اضافه.",
        path: "/learn/de-fa/A2/A2-M14-L04"
      }
    ]
  },
  {
    id: "module-15",
    title: "بخش ۱۵: سوالات غیرمستقیم (Indirekte Fragen)",
    level: "A2",
    lessons: [
      {
        id: "A2-M15-L01",
        title: "Indirekte Fragen mit ob - سوالات با ob",
        description: "یاد بگیرید چطور سوالات بله/خیر را به صورت غیرمستقیم بپرسید.",
        path: "/learn/de-fa/A2/A2-M15-L01"
      },
      {
        id: "A2-M15-L02",
        title: "Indirekte W-Fragen - سوالات با کلمات پرسشی",
        description: "یاد بگیرید چطور سوالات با wer، was، wo، wann، wie را به صورت غیرمستقیم بپرسید.",
        path: "/learn/de-fa/A2/A2-M15-L02"
      },
      {
        id: "A2-M15-L03",
        title: "Höfliche Fragen - سوالات مودبانه",
        description: "یاد بگیرید چطور با könnten، würden و dürfte سوالات مودبانه بپرسید.",
        path: "/learn/de-fa/A2/A2-M15-L03"
      },
      {
        id: "A2-M15-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی همه انواع سوالات غیرمستقیم.",
        path: "/learn/de-fa/A2/A2-M15-L04"
      }
    ]
  },
  {
    id: "module-16",
    title: "بخش ۱۶: ماضی بعید (Plusquamperfekt)",
    level: "A2",
    lessons: [
      {
        id: "A2-M16-L01",
        title: "Plusquamperfekt: Bildung - ساختار",
        description: "یاد بگیرید چطور ماضی بعید را با hatte/war + Partizip II بسازید.",
        path: "/learn/de-fa/A2/A2-M16-L01"
      },
      {
        id: "A2-M16-L02",
        title: "Plusquamperfekt mit haben - با haben",
        description: "یاد بگیرید چطور ماضی بعید را با hatte + Partizip II برای اکثر فعل‌ها بسازید.",
        path: "/learn/de-fa/A2/A2-M16-L02"
      },
      {
        id: "A2-M16-L03",
        title: "Plusquamperfekt mit sein - با sein",
        description: "یاد بگیرید چطور ماضی بعید را با war + Partizip II برای فعل‌های حرکتی بسازید.",
        path: "/learn/de-fa/A2/A2-M16-L03"
      },
      {
        id: "A2-M16-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "تمرین ترکیبی ماضی بعید با hatte و war و کاربرد با nachdem و bevor.",
        path: "/learn/de-fa/A2/A2-M16-L04"
      }
    ]
  },
  {
    id: "module-17",
    title: "بخش ۱۷: فعل‌های انعکاسی (Reflexive Verben)",
    level: "A2",
    lessons: [
      {
        id: "A2-M17-L01",
        title: "Reflexivpronomen - ضمایر انعکاسی",
        description: "یاد بگیرید ضمایر انعکاسی (mich, dich, sich, uns, euch) را برای فعل‌های بازتابی.",
        path: "/learn/de-fa/A2/A2-M17-L01"
      },
      {
        id: "A2-M17-L02",
        title: "Reflexive Verben mit Akkusativ - فعل‌های انعکاسی با آکوزاتیو",
        description: "یاد بگیرید فعل‌های انعکاسی رایج که با ضمیر آکوزاتیو می‌آیند.",
        path: "/learn/de-fa/A2/A2-M17-L02"
      },
      {
        id: "A2-M17-L03",
        title: "Reflexive Verben mit Dativ - فعل‌های انعکاسی با داتیو",
        description: "یاد بگیرید فعل‌های انعکاسی که با ضمیر داتیو (mir, dir, sich) می‌آیند.",
        path: "/learn/de-fa/A2/A2-M17-L03"
      },
      {
        id: "A2-M17-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل فعل‌های انعکاسی با ضمایر آکوزاتیو و داتیو.",
        path: "/learn/de-fa/A2/A2-M17-L04"
      }
    ]
  },
  {
    id: "module-18",
    title: "بخش ۱۸: حالت ژنیتیو (Genitiv)",
    level: "A2",
    lessons: [
      {
        id: "A2-M18-L01",
        title: "Genitiv: Bildung - ساختار ژنیتیو",
        description: "یاد بگیرید حالت ژنیتیو (مالکیت) را با حروف تعریف des, der و پسوندهای -s/-es.",
        path: "/learn/de-fa/A2/A2-M18-L01"
      },
      {
        id: "A2-M18-L02",
        title: "Genitiv mit Präpositionen - ژنیتیو با حروف اضافه",
        description: "یاد بگیرید حروف اضافه‌ای که با ژنیتیو می‌آیند: wegen, trotz, während, statt.",
        path: "/learn/de-fa/A2/A2-M18-L02"
      },
      {
        id: "A2-M18-L03",
        title: "Genitiv vs. von + Dativ - ژنیتیو در مقابل von",
        description: "یاد بگیرید چه وقت می‌توان از von + Dativ به جای ژنیتیو استفاده کرد.",
        path: "/learn/de-fa/A2/A2-M18-L03"
      },
      {
        id: "A2-M18-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل حالت ژنیتیو: ساختار، حروف اضافه و جایگزین‌ها.",
        path: "/learn/de-fa/A2/A2-M18-L04"
      }
    ]
  }
];

const DE_FA_B1_MODULES: ModuleStub[] = [
  {
    id: "module-01",
    title: "بخش ۱: صرف-N (N-Deklination)",
    level: "B1",
    lessons: [
      {
        id: "B1-M01-L01",
        title: "N-Deklination: Einführung - معرفی",
        description: "یاد بگیرید اسم‌های مذکر ضعیف را که در همه حالات (به جز Nominativ) پسوند -(e)n می‌گیرند.",
        path: "/learn/de-fa/B1/B1-M01-L01"
      },
      {
        id: "B1-M01-L02",
        title: "N-Deklination: Weitere Beispiele - نمونه‌های بیشتر",
        description: "اسم‌های بیشتری با صرف-N یاد بگیرید: der Nachbar, der Experte, der Polizist و غیره.",
        path: "/learn/de-fa/B1/B1-M01-L02"
      },
      {
        id: "B1-M01-L03",
        title: "N-Deklination: Ausnahmen - استثناها",
        description: "استثناهای N-Deklination را یاد بگیرید: das Herz، der Name، der Buchstabe و غیره.",
        path: "/learn/de-fa/B1/B1-M01-L03"
      },
      {
        id: "B1-M01-L04",
        title: "N-Deklination: Zusammenfassung - جمع‌بندی",
        description: "مرور کامل N-Deklination: همه قوانین، استثناها و تمرین‌های ترکیبی.",
        path: "/learn/de-fa/B1/B1-M01-L04"
      }
    ]
  },
  {
    id: "module-02",
    title: "بخش ۲: صفات فعلی (Partizipien als Adjektive)",
    level: "B1",
    lessons: [
      {
        id: "B1-M02-L01",
        title: "Partizip I als Adjektiv - صفت فاعلی",
        description: "یاد بگیرید چطور از Partizip I به عنوان صفت استفاده کنید: der schlafende Hund.",
        path: "/learn/de-fa/B1/B1-M02-L01"
      },
      {
        id: "B1-M02-L02",
        title: "Partizip II als Adjektiv - صفت مفعولی",
        description: "یاد بگیرید چطور از Partizip II به عنوان صفت استفاده کنید: das gekochte Ei.",
        path: "/learn/de-fa/B1/B1-M02-L02"
      },
      {
        id: "B1-M02-L03",
        title: "Erweiterte Partizipien - صفات فعلی گسترده",
        description: "یاد بگیرید چطور صفات فعلی را گسترش دهید: der auf dem Sofa schlafende Hund.",
        path: "/learn/de-fa/B1/B1-M02-L03"
      },
      {
        id: "B1-M02-L04",
        title: "Zusammenfassung - جمع‌بندی صفات فعلی",
        description: "مرور کامل Partizip I، Partizip II و ساختارهای گسترده.",
        path: "/learn/de-fa/B1/B1-M02-L04"
      }
    ]
  },
  {
    id: "module-03",
    title: "بخش ۳: کنیونکتیو ۱ (Konjunktiv I)",
    level: "B1",
    lessons: [
      {
        id: "B1-M03-L01",
        title: "Konjunktiv I: Bildung - ساختار",
        description: "یاد بگیرید چطور Konjunktiv I را بسازید: er sage, sie habe, es sei.",
        path: "/learn/de-fa/B1/B1-M03-L01"
      },
      {
        id: "B1-M03-L02",
        title: "Indirekte Rede - نقل قول غیرمستقیم",
        description: "یاد بگیرید چطور گفته‌های دیگران را با Konjunktiv I نقل کنید.",
        path: "/learn/de-fa/B1/B1-M03-L02"
      },
      {
        id: "B1-M03-L03",
        title: "Ersatzformen - شکل‌های جایگزین",
        description: "یاد بگیرید چه زمانی از Konjunktiv II به جای Konjunktiv I استفاده کنید.",
        path: "/learn/de-fa/B1/B1-M03-L03"
      },
      {
        id: "B1-M03-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل Konjunktiv I: ساختار، نقل قول غیرمستقیم و شکل‌های جایگزین.",
        path: "/learn/de-fa/B1/B1-M03-L04"
      }
    ]
  },
  {
    id: "module-04",
    title: "بخش ۴: کلمات ربط دوتایی (Doppelkonnektoren)",
    level: "B1",
    lessons: [
      {
        id: "B1-M04-L01",
        title: "je...desto/umso - هرچه...هرچه",
        description: "یاد بگیرید چطور با je...desto/umso رابطه تناسبی بیان کنید.",
        path: "/learn/de-fa/B1/B1-M04-L01"
      },
      {
        id: "B1-M04-L02",
        title: "sowohl...als auch / weder...noch",
        description: "یاد بگیرید چطور با sowohl...als auch (هم...هم) و weder...noch (نه...نه) صحبت کنید.",
        path: "/learn/de-fa/B1/B1-M04-L02"
      },
      {
        id: "B1-M04-L03",
        title: "entweder...oder / nicht nur...sondern auch",
        description: "یاد بگیرید چطور با entweder...oder (یا...یا) و nicht nur...sondern auch (نه تنها...بلکه) صحبت کنید.",
        path: "/learn/de-fa/B1/B1-M04-L03"
      },
      {
        id: "B1-M04-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل همه کلمات ربط دوتایی: je...desto، sowohl...als auch، weder...noch، entweder...oder، nicht nur...sondern auch",
        path: "/learn/de-fa/B1/B1-M04-L04"
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
const MODULE_DATA: Record<string, { A1: ModuleStub[]; A2: ModuleStub[]; B1: ModuleStub[] }> = {
  'de-fa': {
    A1: DE_FA_A1_MODULES,
    A2: DE_FA_A2_MODULES,
    B1: DE_FA_B1_MODULES,
  },
  'en-fa': {
    A1: EN_FA_A1_MODULES,
    A2: EN_FA_A2_MODULES,
    B1: [],
  },
};

/**
 * Get all modules for a specific language pair
 */
export function getAllModulesForLanguage(languagePair: string): { A1: ModuleStub[]; A2: ModuleStub[]; B1: ModuleStub[] } {
  return MODULE_DATA[languagePair] || { A1: [], A2: [], B1: [] };
}

/**
 * Get modules for a specific language pair and level
 */
export function getModulesForLevel(languagePair: string, level: 'A1' | 'A2' | 'B1'): ModuleStub[] {
  return MODULE_DATA[languagePair]?.[level] || [];
}

// Backward compatibility exports (for existing code that imports these directly)
export const A1_MODULES = DE_FA_A1_MODULES;
export const A2_MODULES = DE_FA_A2_MODULES;
export const B1_MODULES = DE_FA_B1_MODULES;
