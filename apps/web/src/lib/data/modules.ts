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
  },
  {
    id: "module-05",
    title: "بخش ۵: جملات موصولی با حروف اضافه (Relativsätze mit Präpositionen)",
    level: "B1",
    lessons: [
      {
        id: "B1-M05-L01",
        title: "Relativsätze mit Akkusativ-Präpositionen",
        description: "یاد بگیرید جملات موصولی با حروف اضافه آکوزاتیو بسازید: für den, gegen die, ohne das",
        path: "/learn/de-fa/B1/B1-M05-L01"
      },
      {
        id: "B1-M05-L02",
        title: "Relativsätze mit Dativ-Präpositionen",
        description: "یاد بگیرید جملات موصولی با حروف اضافه داتیو بسازید: mit dem, bei der, von denen",
        path: "/learn/de-fa/B1/B1-M05-L02"
      },
      {
        id: "B1-M05-L03",
        title: "Relativsätze mit Wechselpräpositionen",
        description: "یاد بگیرید جملات موصولی با حروف اضافه دوگانه بسازید: auf dem (Wo?) یا auf den (Wohin?)",
        path: "/learn/de-fa/B1/B1-M05-L03"
      },
      {
        id: "B1-M05-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات موصولی با همه انواع حروف اضافه: آکوزاتیو، داتیو و دوگانه",
        path: "/learn/de-fa/B1/B1-M05-L04"
      }
    ]
  },
  {
    id: "module-06",
    title: "بخش ۶: کنیونکتیو ۲ گذشته (Konjunktiv II Vergangenheit)",
    level: "B1",
    lessons: [
      {
        id: "B1-M06-L01",
        title: "hätte + Partizip II",
        description: "یاد بگیرید چطور با hätte + Partizip II درباره موقعیت‌های غیرواقعی در گذشته صحبت کنید.",
        path: "/learn/de-fa/B1/B1-M06-L01"
      },
      {
        id: "B1-M06-L02",
        title: "wäre + Partizip II",
        description: "یاد بگیرید چطور با wäre + Partizip II برای فعل‌های حرکتی و تغییر حالت صحبت کنید.",
        path: "/learn/de-fa/B1/B1-M06-L02"
      },
      {
        id: "B1-M06-L03",
        title: "Irreale Bedingungssätze - جملات شرطی غیرواقعی",
        description: "یاد بگیرید چطور جملات شرطی غیرواقعی در گذشته بسازید: با wenn و بدون wenn.",
        path: "/learn/de-fa/B1/B1-M06-L03"
      },
      {
        id: "B1-M06-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل Konjunktiv II Vergangenheit: hätte/wäre + Partizip II و جملات شرطی.",
        path: "/learn/de-fa/B1/B1-M06-L04"
      }
    ]
  },
  {
    id: "module-07",
    title: "بخش ۷: قیدهای حرف اضافه‌ای (Präpositionaladverbien)",
    level: "B1",
    lessons: [
      {
        id: "B1-M07-L01",
        title: "da-Komposita mit Akkusativ - ترکیبات da با آکوزاتیو",
        description: "یاد بگیرید ترکیبات da با حروف اضافه آکوزاتیو: dafür, dagegen, darauf, darum, dadurch.",
        path: "/learn/de-fa/B1/B1-M07-L01"
      },
      {
        id: "B1-M07-L02",
        title: "da-Komposita mit Dativ - ترکیبات da با داتیو",
        description: "یاد بگیرید ترکیبات da با حروف اضافه داتیو: damit, davon, dabei, danach, davor, dazu.",
        path: "/learn/de-fa/B1/B1-M07-L02"
      },
      {
        id: "B1-M07-L03",
        title: "wo-Komposita - ترکیبات wo برای سوال",
        description: "یاد بگیرید ترکیبات wo برای سوالات: wofür, worauf, womit, wovon, worüber.",
        path: "/learn/de-fa/B1/B1-M07-L03"
      },
      {
        id: "B1-M07-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل قیدهای حرف اضافه‌ای: ترکیبات da و wo برای اشیا در مقابل افراد.",
        path: "/learn/de-fa/B1/B1-M07-L04"
      }
    ]
  },
  {
    id: "module-08",
    title: "بخش ۸: مجهول پیشرفته (Passiv Erweiterung)",
    level: "B1",
    lessons: [
      {
        id: "B1-M08-L01",
        title: "Passiv mit Modalverben - مجهول با افعال وجهی",
        description: "یاد بگیرید چطور مجهول را با kann, muss, soll ترکیب کنید: Das kann gemacht werden.",
        path: "/learn/de-fa/B1/B1-M08-L01"
      },
      {
        id: "B1-M08-L02",
        title: "Passiv Präteritum - مجهول گذشته ساده",
        description: "یاد بگیرید چطور مجهول گذشته ساده بسازید: wurde/wurden + Partizip II.",
        path: "/learn/de-fa/B1/B1-M08-L02"
      },
      {
        id: "B1-M08-L03",
        title: "Passiv mit von und durch - مجهول با عامل",
        description: "یاد بگیرید چه وقت از von (برای افراد) و durch (برای وسیله) استفاده کنید.",
        path: "/learn/de-fa/B1/B1-M08-L03"
      },
      {
        id: "B1-M08-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل مجهول پیشرفته: با افعال وجهی، گذشته ساده و عامل‌ها.",
        path: "/learn/de-fa/B1/B1-M08-L04"
      }
    ]
  },
  {
    id: "module-09",
    title: "بخش ۹: اسم‌سازی (Nominalisierung)",
    level: "B1",
    lessons: [
      {
        id: "B1-M09-L01",
        title: "Nominalisierung von Verben - اسم‌سازی از فعل",
        description: "یاد بگیرید چطور از مصدر اسم بسازید: das Lernen, das Lesen, das Schwimmen.",
        path: "/learn/de-fa/B1/B1-M09-L01"
      },
      {
        id: "B1-M09-L02",
        title: "Nominalisierung von Adjektiven - اسم‌سازی از صفت",
        description: "یاد بگیرید چطور از صفت اسم بسازید: das Gute, das Schöne, der/die Alte.",
        path: "/learn/de-fa/B1/B1-M09-L02"
      },
      {
        id: "B1-M09-L03",
        title: "Nominalisierung mit Suffixen - اسم‌سازی با پسوند",
        description: "یاد بگیرید پسوندهای اسم‌ساز: -ung, -heit, -keit, -schaft, -tion (همه مونث!).",
        path: "/learn/de-fa/B1/B1-M09-L03"
      },
      {
        id: "B1-M09-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل اسم‌سازی: از فعل، از صفت و با پسوندها.",
        path: "/learn/de-fa/B1/B1-M09-L04"
      }
    ]
  },
  {
    id: "module-10",
    title: "بخش ۱۰: افعال با حروف اضافه (Verben mit Präpositionen)",
    level: "B1",
    lessons: [
      {
        id: "B1-M10-L01",
        title: "Verben mit Akkusativ-Präpositionen - افعال با آکوزاتیو",
        description: "یاد بگیرید افعال با حروف اضافه آکوزاتیو: warten auf, denken an, sich freuen auf.",
        path: "/learn/de-fa/B1/B1-M10-L01"
      },
      {
        id: "B1-M10-L02",
        title: "Verben mit Dativ-Präpositionen - افعال با داتیو",
        description: "یاد بگیرید افعال با حروف اضافه داتیو: träumen von, sprechen mit, gehören zu.",
        path: "/learn/de-fa/B1/B1-M10-L02"
      },
      {
        id: "B1-M10-L03",
        title: "Reflexive Verben mit Präpositionen - افعال انعکاسی",
        description: "یاد بگیرید افعال انعکاسی با حروف اضافه: sich interessieren für, sich freuen über.",
        path: "/learn/de-fa/B1/B1-M10-L03"
      },
      {
        id: "B1-M10-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل افعال با حروف اضافه: آکوزاتیو، داتیو و افعال انعکاسی.",
        path: "/learn/de-fa/B1/B1-M10-L04"
      }
    ]
  },
  {
    id: "module-11",
    title: "بخش ۱۱: آینده کامل (Futur II)",
    level: "B1",
    lessons: [
      {
        id: "B1-M11-L01",
        title: "Futur II: Bildung - ساختار",
        description: "یاد بگیرید چطور Futur II را بسازید: werden + Partizip II + haben/sein.",
        path: "/learn/de-fa/B1/B1-M11-L01"
      },
      {
        id: "B1-M11-L02",
        title: "Vermutungen über die Vergangenheit - حدس درباره گذشته",
        description: "یاد بگیرید چطور با Futur II درباره گذشته حدس بزنید: Er wird gegangen sein.",
        path: "/learn/de-fa/B1/B1-M11-L02"
      },
      {
        id: "B1-M11-L03",
        title: "Abgeschlossene Handlungen - کارهای تمام‌شده در آینده",
        description: "یاد بگیرید چطور بگویید کاری تا زمان مشخصی تمام شده: Bis morgen werde ich es gemacht haben.",
        path: "/learn/de-fa/B1/B1-M11-L03"
      },
      {
        id: "B1-M11-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل Futur II: ساختار، حدس درباره گذشته و کارهای تمام‌شده در آینده.",
        path: "/learn/de-fa/B1/B1-M11-L04"
      }
    ]
  },
  {
    id: "module-12",
    title: "بخش ۱۲: ذرات مودال (Modalpartikeln)",
    level: "B1",
    lessons: [
      {
        id: "B1-M12-L01",
        title: "doch und ja - تأکید و تعجب",
        description: "یاد بگیرید چطور با doch و ja به جملات تأکید، تعجب و اشتراک دانش اضافه کنید.",
        path: "/learn/de-fa/B1/B1-M12-L01"
      },
      {
        id: "B1-M12-L02",
        title: "mal, eben, halt - نرم‌کننده‌ها",
        description: "یاد بگیرید چطور با mal درخواست‌ها را نرم کنید و با eben/halt پذیرش بیان کنید.",
        path: "/learn/de-fa/B1/B1-M12-L02"
      },
      {
        id: "B1-M12-L03",
        title: "eigentlich, wohl, schon - ظرافت‌ها",
        description: "یاد بگیرید چطور با eigentlich، wohl و schon احتمال، تردید و اطمینان بیان کنید.",
        path: "/learn/de-fa/B1/B1-M12-L03"
      },
      {
        id: "B1-M12-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل همه ذرات مودال: doch، ja، mal، eben، halt، eigentlich، wohl، schon.",
        path: "/learn/de-fa/B1/B1-M12-L04"
      }
    ]
  },
  {
    id: "module-13",
    title: "بخش ۱۳: ترکیبات اسم-فعل (Nomen-Verb-Verbindungen)",
    level: "B1",
    lessons: [
      {
        id: "B1-M13-L01",
        title: "machen, haben, nehmen - ترکیبات پایه",
        description: "یاد بگیرید ترکیبات ثابت با machen، haben و nehmen: Fehler machen، Angst haben، Abschied nehmen.",
        path: "/learn/de-fa/B1/B1-M13-L01"
      },
      {
        id: "B1-M13-L02",
        title: "stellen, geben, bringen - ترکیبات رسمی",
        description: "یاد بگیرید ترکیبات با stellen، geben و bringen: Frage stellen، Bescheid geben، zum Ausdruck bringen.",
        path: "/learn/de-fa/B1/B1-M13-L02"
      },
      {
        id: "B1-M13-L03",
        title: "treffen, führen, kommen - ترکیبات پیشرفته",
        description: "یاد بگیرید ترکیبات با treffen، führen و kommen: Entscheidung treffen، Gespräch führen، zu Wort kommen.",
        path: "/learn/de-fa/B1/B1-M13-L03"
      },
      {
        id: "B1-M13-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل همه ترکیبات اسم-فعل: machen، haben، nehmen، stellen، geben، bringen، treffen، führen، kommen.",
        path: "/learn/de-fa/B1/B1-M13-L04"
      }
    ]
  },
  {
    id: "module-14",
    title: "بخش ۱۴: صفات با حروف اضافه (Adjektive mit Präpositionen)",
    level: "B1",
    lessons: [
      {
        id: "B1-M14-L01",
        title: "Akkusativ-Präpositionen - صفات با آکوزاتیو",
        description: "یاد بگیرید صفات با حروف اضافه آکوزاتیو: stolz auf، verantwortlich für، glücklich über.",
        path: "/learn/de-fa/B1/B1-M14-L01"
      },
      {
        id: "B1-M14-L02",
        title: "Dativ-Präpositionen - صفات با داتیو",
        description: "یاد بگیرید صفات با حروف اضافه داتیو: zufrieden mit، abhängig von، interessiert an.",
        path: "/learn/de-fa/B1/B1-M14-L02"
      },
      {
        id: "B1-M14-L03",
        title: "Genitiv und Sonderfälle - ژنیتیو و موارد خاص",
        description: "یاد بگیرید صفات با ژنیتیو و جفت‌های خاص: sicher، bewusst، böse auf vs böse mit.",
        path: "/learn/de-fa/B1/B1-M14-L03"
      },
      {
        id: "B1-M14-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل صفات با حروف اضافه: آکوزاتیو، داتیو، ژنیتیو و اشتباهات رایج.",
        path: "/learn/de-fa/B1/B1-M14-L04"
      }
    ]
  },
  {
    id: "module-15",
    title: "بخش ۱۵: جملات پیرو پیشرفته (Erweiterte Nebensätze)",
    level: "B1",
    lessons: [
      {
        id: "B1-M15-L01",
        title: "Kausale Nebensätze - جملات علّی",
        description: "یاد بگیرید جملات علّی با weil، da و zumal: بیان دلیل و علت.",
        path: "/learn/de-fa/B1/B1-M15-L01"
      },
      {
        id: "B1-M15-L02",
        title: "Konzessive Nebensätze - جملات امتیازی",
        description: "یاد بگیرید جملات امتیازی با obwohl، obgleich و auch wenn: بیان تضاد.",
        path: "/learn/de-fa/B1/B1-M15-L02"
      },
      {
        id: "B1-M15-L03",
        title: "Konsekutive und finale Nebensätze - نتیجه و هدف",
        description: "یاد بگیرید جملات نتیجه‌ای با sodass و جملات هدفی با damit و um...zu.",
        path: "/learn/de-fa/B1/B1-M15-L03"
      },
      {
        id: "B1-M15-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات پیرو: علّی، امتیازی، نتیجه‌ای و هدفی.",
        path: "/learn/de-fa/B1/B1-M15-L04"
      }
    ]
  },
  {
    id: "module-16",
    title: "بخش ۱۶: جملات زمانی (Temporale Nebensätze)",
    level: "B1",
    lessons: [
      {
        id: "B1-M16-L01",
        title: "als und wenn - وقتی که",
        description: "یاد بگیرید تفاوت als (یک‌بار در گذشته) و wenn (مکرر یا حال/آینده).",
        path: "/learn/de-fa/B1/B1-M16-L01"
      },
      {
        id: "B1-M16-L02",
        title: "während, bevor, nachdem - در حین، قبل، بعد",
        description: "یاد بگیرید جملات همزمان و متوالی با während، bevor و nachdem.",
        path: "/learn/de-fa/B1/B1-M16-L02"
      },
      {
        id: "B1-M16-L03",
        title: "seitdem, bis, sobald - از وقتی، تا، به محض",
        description: "یاد بگیرید جملات مدت‌دار با seitdem، bis، sobald و solange.",
        path: "/learn/de-fa/B1/B1-M16-L03"
      },
      {
        id: "B1-M16-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات زمانی: als، wenn، während، bevor، nachdem، seitdem، bis، sobald.",
        path: "/learn/de-fa/B1/B1-M16-L04"
      }
    ]
  },
  {
    id: "module-17",
    title: "بخش ۱۷: ساختار واژه (Wortbildung)",
    level: "B1",
    lessons: [
      {
        id: "B1-M17-L01",
        title: "Verbpräfixe - پیشوندهای فعل",
        description: "یاد بگیرید پیشوندهای جداشدنی (ab-، auf-) و جدانشدنی (be-، ver-) و تأثیر آن‌ها بر معنی.",
        path: "/learn/de-fa/B1/B1-M17-L01"
      },
      {
        id: "B1-M17-L02",
        title: "Substantivbildung - ساخت اسم",
        description: "یاد بگیرید پسوندهای اسم‌ساز: -ung، -heit، -keit، -schaft، -nis و جنسیت آن‌ها.",
        path: "/learn/de-fa/B1/B1-M17-L02"
      },
      {
        id: "B1-M17-L03",
        title: "Adjektive und Komposita - صفت و ترکیبات",
        description: "یاد بگیرید پسوندهای صفت‌ساز (-lich، -ig، -bar) و کلمات مرکب آلمانی.",
        path: "/learn/de-fa/B1/B1-M17-L03"
      },
      {
        id: "B1-M17-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل ساختار واژه: پیشوندها، پسوندها، کلمات مرکب و استراتژی‌های یادگیری.",
        path: "/learn/de-fa/B1/B1-M17-L04"
      }
    ]
  },
  {
    id: "module-18",
    title: "بخش ۱۸: جملات مقایسه‌ای غیرواقعی (Irreale Vergleichssätze)",
    level: "B1",
    lessons: [
      {
        id: "B1-M18-L01",
        title: "als ob + Konjunktiv II Präsens - انگار که (حال)",
        description: "یاد بگیرید ساختار als ob برای مقایسه‌های غیرواقعی با فعل کونیونکتیو دوم حال.",
        path: "/learn/de-fa/B1/B1-M18-L01"
      },
      {
        id: "B1-M18-L02",
        title: "als ob + Konjunktiv II Vergangenheit - انگار که (گذشته)",
        description: "یاد بگیرید ساختار als ob برای مقایسه‌های غیرواقعی با hätte/wäre + Partizip II.",
        path: "/learn/de-fa/B1/B1-M18-L02"
      },
      {
        id: "B1-M18-L03",
        title: "als, als wenn, wie wenn - ساختارهای جایگزین",
        description: "یاد بگیرید ساختارهای جایگزین als ob: استفاده از als، als wenn و wie wenn.",
        path: "/learn/de-fa/B1/B1-M18-L03"
      },
      {
        id: "B1-M18-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات مقایسه‌ای غیرواقعی: als ob، als wenn، als و تمرین‌های ترکیبی.",
        path: "/learn/de-fa/B1/B1-M18-L04"
      }
    ]
  },
  {
    id: "module-19",
    title: "بخش ۱۹: جایگزین‌های مجهول (Passiversatzformen)",
    level: "B1",
    lessons: [
      {
        id: "B1-M19-L01",
        title: "sein + zu + Infinitiv - ساختار اول",
        description: "یاد بگیرید ساختار sein + zu + Infinitiv برای بیان ضرورت یا امکان به جای مجهول.",
        path: "/learn/de-fa/B1/B1-M19-L01"
      },
      {
        id: "B1-M19-L02",
        title: "sich lassen + Infinitiv - ساختار دوم",
        description: "یاد بگیرید ساختار sich lassen + Infinitiv برای بیان امکان به جای مجهول.",
        path: "/learn/de-fa/B1/B1-M19-L02"
      },
      {
        id: "B1-M19-L03",
        title: "Adjektive auf -bar, -lich, -abel - صفات",
        description: "یاد بگیرید صفات با پسوند -bar، -lich، -abel برای بیان امکان: machbar، verständlich، akzeptabel.",
        path: "/learn/de-fa/B1/B1-M19-L03"
      },
      {
        id: "B1-M19-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جایگزین‌های مجهول: sein + zu، sich lassen و صفات -bar/-lich/-abel.",
        path: "/learn/de-fa/B1/B1-M19-L04"
      }
    ]
  },
  {
    id: "module-20",
    title: "بخش ۲۰: کاربرد ذهنی افعال کمکی (Subjektiver Gebrauch der Modalverben)",
    level: "B1",
    lessons: [
      {
        id: "B1-M20-L01",
        title: "müssen und können - حدس و احتمال",
        description: "یاد بگیرید استفاده ذهنی از müssen و können برای بیان حدس و احتمال.",
        path: "/learn/de-fa/B1/B1-M20-L01"
      },
      {
        id: "B1-M20-L02",
        title: "dürfte, sollte, mag - درجات احتمال",
        description: "یاد بگیرید dürfte، sollte و mag برای بیان درجات مختلف احتمال.",
        path: "/learn/de-fa/B1/B1-M20-L02"
      },
      {
        id: "B1-M20-L03",
        title: "Vermutungen über die Vergangenheit - حدس درباره گذشته",
        description: "یاد بگیرید حدس زدن درباره گذشته: Modal + Partizip II + haben/sein.",
        path: "/learn/de-fa/B1/B1-M20-L03"
      },
      {
        id: "B1-M20-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل کاربرد ذهنی افعال کمکی: müssen، dürfte، können، mag و حدس درباره گذشته.",
        path: "/learn/de-fa/B1/B1-M20-L04"
      }
    ]
  }
];

// German B2 modules
const DE_FA_B2_MODULES: ModuleStub[] = [
  {
    id: "module-01",
    title: "بخش ۱: ساختارهای صفت فاعلی گسترده (Erweiterte Partizipialkonstruktionen)",
    level: "B2",
    lessons: [
      {
        id: "B2-M01-L01",
        title: "Partizip I erweitert - صفت فاعلی گسترده",
        description: "یاد بگیرید ساختارهای گسترده با Partizip I: der laut sprechende Mann.",
        path: "/learn/de-fa/B2/B2-M01-L01"
      },
      {
        id: "B2-M01-L02",
        title: "Partizip II erweitert - صفت مفعولی گسترده",
        description: "یاد بگیرید ساختارهای گسترده با Partizip II: das gestern gekaufte Buch.",
        path: "/learn/de-fa/B2/B2-M01-L02"
      },
      {
        id: "B2-M01-L03",
        title: "Auflösen in Relativsätze - تبدیل به جمله موصولی",
        description: "یاد بگیرید تبدیل ساختارهای صفت فاعلی به جملات موصولی و برعکس.",
        path: "/learn/de-fa/B2/B2-M01-L03"
      },
      {
        id: "B2-M01-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل ساختارهای صفت فاعلی گسترده: Partizip I، Partizip II و تبدیل.",
        path: "/learn/de-fa/B2/B2-M01-L04"
      }
    ]
  },
  {
    id: "module-02",
    title: "بخش ۲: سبک اسمی (Nominaler Stil)",
    level: "B2",
    lessons: [
      {
        id: "B2-M02-L01",
        title: "Nominalisierung - اسمی‌سازی",
        description: "یاد بگیرید تبدیل جملات فعلی به سبک اسمی: analysieren → die Analyse.",
        path: "/learn/de-fa/B2/B2-M02-L01"
      },
      {
        id: "B2-M02-L02",
        title: "Nominale Präpositionalphrasen - عبارات حرف اضافه‌ای",
        description: "یاد بگیرید حروف اضافه رسمی با Genitiv: aufgrund، infolge، zwecks، anhand.",
        path: "/learn/de-fa/B2/B2-M02-L02"
      },
      {
        id: "B2-M02-L03",
        title: "Funktionsverbgefüge - ترکیبات فعل-اسم",
        description: "یاد بگیرید ترکیبات رسمی: zur Verfügung stellen، in Betracht ziehen.",
        path: "/learn/de-fa/B2/B2-M02-L03"
      },
      {
        id: "B2-M02-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل سبک اسمی: اسمی‌سازی، حروف اضافه و ترکیبات فعل-اسم.",
        path: "/learn/de-fa/B2/B2-M02-L04"
      }
    ]
  },
  {
    id: "module-03",
    title: "بخش ۳: Konjunktiv I در مطبوعات",
    level: "B2",
    lessons: [
      {
        id: "B2-M03-L01",
        title: "Grundlagen des Konjunktiv I - مبانی وجه التزامی یک",
        description: "یاد بگیرید وجه التزامی یک برای نقل قول غیرمستقیم: er sei، sie habe، man könne.",
        path: "/learn/de-fa/B2/B2-M03-L01"
      },
      {
        id: "B2-M03-L02",
        title: "Ersatzformen mit Konjunktiv II - فرم‌های جایگزین",
        description: "یاد بگیرید وقتی Konjunktiv I = Indikativ است، از Konjunktiv II استفاده کنید: hätten، würden.",
        path: "/learn/de-fa/B2/B2-M03-L02"
      },
      {
        id: "B2-M03-L03",
        title: "Redeeinleitungen - عبارات معرفی نقل قول",
        description: "یاد بگیرید عبارات معرفی منبع: laut dem Bericht، Experten zufolge، wie X mitteilte.",
        path: "/learn/de-fa/B2/B2-M03-L03"
      },
      {
        id: "B2-M03-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل Konjunktiv I در مطبوعات: فرم‌ها، جایگزین‌ها و عبارات نقل قول.",
        path: "/learn/de-fa/B2/B2-M03-L04"
      }
    ]
  },
  {
    id: "module-04",
    title: "بخش ۴: Passiv-Alternativen",
    level: "B2",
    lessons: [
      {
        id: "B2-M04-L01",
        title: "sich lassen + Infinitiv - جایگزین مجهول با lassen",
        description: "یاد بگیرید ساختار 'Das lässt sich machen' به جای 'Das kann gemacht werden'.",
        path: "/learn/de-fa/B2/B2-M04-L01"
      },
      {
        id: "B2-M04-L02",
        title: "sein + zu + Infinitiv - ساختار الزام یا امکان",
        description: "یاد بگیرید 'Die Aufgabe ist zu erledigen' برای بیان باید یا می‌توان.",
        path: "/learn/de-fa/B2/B2-M04-L02"
      },
      {
        id: "B2-M04-L03",
        title: "Weitere Strukturen - ساختارهای بیشتر",
        description: "یاد بگیرید صفات -bar/-lich، bleiben + Partizip II و es gibt + zu.",
        path: "/learn/de-fa/B2/B2-M04-L03"
      },
      {
        id: "B2-M04-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل همه جایگزین‌های مجهول: sich lassen، sein + zu، -bar/-lich.",
        path: "/learn/de-fa/B2/B2-M04-L04"
      }
    ]
  },
  {
    id: "module-05",
    title: "بخش ۵: Konnektoren für Argumentation",
    level: "B2",
    lessons: [
      {
        id: "B2-M05-L01",
        title: "Kontrast - تضاد",
        description: "یاد بگیرید حروف ربط تضاد: jedoch، allerdings، dennoch، trotzdem، hingegen.",
        path: "/learn/de-fa/B2/B2-M05-L01"
      },
      {
        id: "B2-M05-L02",
        title: "Kausalität - علت و معلول",
        description: "یاد بگیرید حروف ربط علّی: daher، deshalb، folglich، infolgedessen، somit.",
        path: "/learn/de-fa/B2/B2-M05-L02"
      },
      {
        id: "B2-M05-L03",
        title: "Ergänzung - افزودن اطلاعات",
        description: "یاد بگیرید حروف ربط اضافی: außerdem، darüber hinaus، zudem، ferner.",
        path: "/learn/de-fa/B2/B2-M05-L03"
      },
      {
        id: "B2-M05-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل حروف ربط استدلال: تضاد، علت و معلول، افزودن.",
        path: "/learn/de-fa/B2/B2-M05-L04"
      }
    ]
  },
  {
    id: "module-06",
    title: "بخش ۶: Komplexe Attribute",
    level: "B2",
    lessons: [
      {
        id: "B2-M06-L01",
        title: "Partizip I erweitert - صفت فعلی یک گسترده",
        description: "یاد بگیرید صفات گسترده با Partizip I: der seit Stunden arbeitende Mann.",
        path: "/learn/de-fa/B2/B2-M06-L01"
      },
      {
        id: "B2-M06-L02",
        title: "Partizip II erweitert - صفت فعلی دو گسترده",
        description: "یاد بگیرید صفات گسترده با Partizip II: das von allen gelesene Buch.",
        path: "/learn/de-fa/B2/B2-M06-L02"
      },
      {
        id: "B2-M06-L03",
        title: "Auflösung in Relativsätze - تبدیل به جملات موصولی",
        description: "یاد بگیرید تبدیل صفات گسترده به جملات موصولی و بالعکس.",
        path: "/learn/de-fa/B2/B2-M06-L03"
      },
      {
        id: "B2-M06-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل صفات پیچیده: Partizip I و II گسترده و تبدیل آنها.",
        path: "/learn/de-fa/B2/B2-M06-L04"
      }
    ]
  },
  {
    id: "module-07",
    title: "بخش ۷: Subjektive Modalverben",
    level: "B2",
    lessons: [
      {
        id: "B2-M07-L01",
        title: "müssen & können - قطعیت و امکان",
        description: "یاد بگیرید استفاده ذهنی از müssen و können برای بیان احتمال.",
        path: "/learn/de-fa/B2/B2-M07-L01"
      },
      {
        id: "B2-M07-L02",
        title: "dürfen & sollen - احتمال و نقل قول",
        description: "یاد بگیرید dürfte برای احتمال بالا و sollen برای شنیده‌ها.",
        path: "/learn/de-fa/B2/B2-M07-L02"
      },
      {
        id: "B2-M07-L03",
        title: "wollen & mögen - ادعا و پذیرش",
        description: "یاد بگیرید wollen برای شک در ادعا و mögen برای پذیرش احتمال.",
        path: "/learn/de-fa/B2/B2-M07-L03"
      },
      {
        id: "B2-M07-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل افعال کمکی ذهنی با مقیاس احتمال.",
        path: "/learn/de-fa/B2/B2-M07-L04"
      }
    ]
  },
  {
    id: "module-08",
    title: "بخش ۸: Textverknüpfung",
    level: "B2",
    lessons: [
      {
        id: "B2-M08-L01",
        title: "Demonstrativpronomen - ضمایر اشاره",
        description: "یاد بگیرید ضمایر اشاره برای پیوند متن: dieser، jener، derjenige، derselbe.",
        path: "/learn/de-fa/B2/B2-M08-L01"
      },
      {
        id: "B2-M08-L02",
        title: "Pronominaladverbien - قیدهای ضمیری",
        description: "یاد بگیرید قیدهای ضمیری برای ارجاع: dafür، dagegen، damit، darauf.",
        path: "/learn/de-fa/B2/B2-M08-L02"
      },
      {
        id: "B2-M08-L03",
        title: "Verweisende Ausdrücke - عبارات ارجاعی",
        description: "یاد بگیرید عبارات ارجاع: Ersteres/Letzteres، wie erwähnt، oben genannt.",
        path: "/learn/de-fa/B2/B2-M08-L03"
      },
      {
        id: "B2-M08-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل پیوند متن: ضمایر اشاره، قیدهای ضمیری و عبارات ارجاع.",
        path: "/learn/de-fa/B2/B2-M08-L04"
      }
    ]
  },
  {
    id: "module-09",
    title: "بخش ۹: Verbalperiphrasen",
    level: "B2",
    lessons: [
      {
        id: "B2-M09-L01",
        title: "Aspektuelle Verben - فعل‌های جنبه‌ای",
        description: "یاد بگیرید فعل‌های شروع، ادامه و پایان: anfangen zu، aufhören zu، fortfahren zu.",
        path: "/learn/de-fa/B2/B2-M09-L01"
      },
      {
        id: "B2-M09-L02",
        title: "Modalitätsverben - فعل‌های وجهی",
        description: "یاد بگیرید فعل‌های وجهی: scheinen zu، drohen zu، pflegen zu، versprechen zu.",
        path: "/learn/de-fa/B2/B2-M09-L02"
      },
      {
        id: "B2-M09-L03",
        title: "Zustandsausdrücke - عبارات حالت",
        description: "یاد بگیرید عبارات حالت: im Begriff sein، dabei sein، imstande sein.",
        path: "/learn/de-fa/B2/B2-M09-L03"
      },
      {
        id: "B2-M09-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل ساختارهای فعلی پیچیده: جنبه‌ای، وجهی و حالت.",
        path: "/learn/de-fa/B2/B2-M09-L04"
      }
    ]
  },
  {
    id: "module-10",
    title: "بخش ۱۰: Modalsätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M10-L01",
        title: "indem - با انجام دادن",
        description: "یاد بگیرید با indem روش انجام کار را بیان کنید.",
        path: "/learn/de-fa/B2/B2-M10-L01"
      },
      {
        id: "B2-M10-L02",
        title: "dadurch dass - از طریق اینکه",
        description: "یاد بگیرید ساختار رسمی dadurch, dass برای بیان روش.",
        path: "/learn/de-fa/B2/B2-M10-L02"
      },
      {
        id: "B2-M10-L03",
        title: "ohne dass / ohne zu - بدون اینکه",
        description: "یاد بگیرید ohne dass و ohne zu برای بیان عدم انجام کار.",
        path: "/learn/de-fa/B2/B2-M10-L03"
      },
      {
        id: "B2-M10-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات وجهی: indem، dadurch dass، ohne dass.",
        path: "/learn/de-fa/B2/B2-M10-L04"
      }
    ]
  },
  {
    id: "module-11",
    title: "بخش ۱۱: Konzessivsätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M11-L01",
        title: "obwohl, obgleich, obschon - با اینکه",
        description: "یاد بگیرید حروف ربط تضادی: obwohl، obgleich، obschon.",
        path: "/learn/de-fa/B2/B2-M11-L01"
      },
      {
        id: "B2-M11-L02",
        title: "trotzdem, dennoch, gleichwohl - با این حال",
        description: "یاد بگیرید قیدهای تضادی: trotzdem، dennoch، gleichwohl.",
        path: "/learn/de-fa/B2/B2-M11-L02"
      },
      {
        id: "B2-M11-L03",
        title: "wenn auch, selbst wenn, auch wenn - حتی اگر",
        description: "یاد بگیرید ساختارهای شرطی-تضادی: wenn auch، selbst wenn، auch wenn.",
        path: "/learn/de-fa/B2/B2-M11-L03"
      },
      {
        id: "B2-M11-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات تضادی: حروف ربط، قیدها و ساختارهای شرطی.",
        path: "/learn/de-fa/B2/B2-M11-L04"
      }
    ]
  },
  {
    id: "module-12",
    title: "بخش ۱۲: Konsekutivsätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M12-L01",
        title: "sodass / so dass - به طوری که",
        description: "یاد بگیرید جملات نتیجه‌ای با sodass برای بیان پیامد.",
        path: "/learn/de-fa/B2/B2-M12-L01"
      },
      {
        id: "B2-M12-L02",
        title: "so...dass - آنقدر...که",
        description: "یاد بگیرید ساختار تشدیدی so + صفت/قید + dass.",
        path: "/learn/de-fa/B2/B2-M12-L02"
      },
      {
        id: "B2-M12-L03",
        title: "Konsekutive Adverbien - قیدهای نتیجه‌ای",
        description: "یاد بگیرید قیدهای نتیجه: folglich، infolgedessen، demzufolge.",
        path: "/learn/de-fa/B2/B2-M12-L03"
      },
      {
        id: "B2-M12-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات نتیجه‌ای: sodass، so...dass و قیدها.",
        path: "/learn/de-fa/B2/B2-M12-L04"
      }
    ]
  },
  {
    id: "module-13",
    title: "بخش ۱۳: Finalsätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M13-L01",
        title: "damit - برای اینکه",
        description: "یاد بگیرید جملات هدفی با damit برای فاعل‌های مختلف.",
        path: "/learn/de-fa/B2/B2-M13-L01"
      },
      {
        id: "B2-M13-L02",
        title: "um...zu - برای اینکه",
        description: "یاد بگیرید ساختار um...zu برای فاعل یکسان.",
        path: "/learn/de-fa/B2/B2-M13-L02"
      },
      {
        id: "B2-M13-L03",
        title: "Formale Finalausdrücke - عبارات هدفی رسمی",
        description: "یاد بگیرید عبارات رسمی: zwecks، zum Zweck، mit dem Ziel.",
        path: "/learn/de-fa/B2/B2-M13-L03"
      },
      {
        id: "B2-M13-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات هدفی: damit، um...zu و عبارات رسمی.",
        path: "/learn/de-fa/B2/B2-M13-L04"
      }
    ]
  },
  {
    id: "module-14",
    title: "بخش ۱۴: Konditionalsätze ohne wenn",
    level: "B2",
    lessons: [
      {
        id: "B2-M14-L01",
        title: "Inversion - جابجایی فعل",
        description: "یاد بگیرید جملات شرطی با جابجایی فعل بدون wenn.",
        path: "/learn/de-fa/B2/B2-M14-L01"
      },
      {
        id: "B2-M14-L02",
        title: "falls, sofern, vorausgesetzt - حروف ربط جایگزین",
        description: "یاد بگیرید حروف ربط شرطی: falls، sofern، vorausgesetzt dass.",
        path: "/learn/de-fa/B2/B2-M14-L02"
      },
      {
        id: "B2-M14-L03",
        title: "es sei denn, andernfalls, sonst - شرط منفی",
        description: "یاد بگیرید عبارات شرط منفی: es sei denn، andernfalls، sonst.",
        path: "/learn/de-fa/B2/B2-M14-L03"
      },
      {
        id: "B2-M14-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات شرطی بدون wenn: جابجایی، حروف ربط و شرط منفی.",
        path: "/learn/de-fa/B2/B2-M14-L04"
      }
    ]
  },
  {
    id: "module-15",
    title: "بخش ۱۵: Erweiterte Relativsätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M15-L01",
        title: "Relativpronomen 'was' - ضمیر موصولی was",
        description: "یاد بگیرید استفاده از was بعد از ضمایر نامعین، صفت عالی و صفات اسمی‌شده.",
        path: "/learn/de-fa/B2/B2-M15-L01"
      },
      {
        id: "B2-M15-L02",
        title: "wo, wohin, woher - قیدهای موصولی مکانی",
        description: "یاد بگیرید قیدهای موصولی مکانی: wo (کجا)، wohin (به کجا)، woher (از کجا).",
        path: "/learn/de-fa/B2/B2-M15-L02"
      },
      {
        id: "B2-M15-L03",
        title: "wo(r)- Komposita - ترکیبات wo(r)-",
        description: "یاد بگیرید ترکیبات موصولی: worauf، worüber، woran، wofür، womit.",
        path: "/learn/de-fa/B2/B2-M15-L03"
      },
      {
        id: "B2-M15-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات موصولی پیشرفته: was، wo/wohin/woher و ترکیبات wo(r)-.",
        path: "/learn/de-fa/B2/B2-M15-L04"
      }
    ]
  },
  {
    id: "module-16",
    title: "بخش ۱۶: Temporalsätze erweitert",
    level: "B2",
    lessons: [
      {
        id: "B2-M16-L01",
        title: "sobald, kaum dass - به محض اینکه",
        description: "یاد بگیرید حروف ربط زمانی فوری: sobald و kaum dass برای توالی سریع.",
        path: "/learn/de-fa/B2/B2-M16-L01"
      },
      {
        id: "B2-M16-L02",
        title: "solange, bis - تا زمانی که",
        description: "یاد بگیرید حروف ربط مدت: solange (تا زمانی که) و bis (تا).",
        path: "/learn/de-fa/B2/B2-M16-L02"
      },
      {
        id: "B2-M16-L03",
        title: "ehe, bevor - قبل از اینکه",
        description: "یاد بگیرید تفاوت ehe (رسمی) و bevor (عادی) برای بیان قبل از.",
        path: "/learn/de-fa/B2/B2-M16-L03"
      },
      {
        id: "B2-M16-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات زمانی پیشرفته: sobald، kaum dass، solange، bis، ehe، bevor.",
        path: "/learn/de-fa/B2/B2-M16-L04"
      }
    ]
  },
  {
    id: "module-17",
    title: "بخش ۱۷: Adversativsätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M17-L01",
        title: "während, wohingegen - در حالی که (تضاد)",
        description: "یاد بگیرید während و wohingegen برای بیان تضاد (نه زمان).",
        path: "/learn/de-fa/B2/B2-M17-L01"
      },
      {
        id: "B2-M17-L02",
        title: "anstatt dass, anstatt zu - به جای اینکه",
        description: "یاد بگیرید ساختارهای «به جای»: anstatt dass (فاعل متفاوت) و anstatt zu (فاعل یکسان).",
        path: "/learn/de-fa/B2/B2-M17-L02"
      },
      {
        id: "B2-M17-L03",
        title: "ohne dass, ohne zu - بدون اینکه",
        description: "یاد بگیرید ساختارهای «بدون»: ohne dass (فاعل متفاوت) و ohne zu (فاعل یکسان).",
        path: "/learn/de-fa/B2/B2-M17-L03"
      },
      {
        id: "B2-M17-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات تقابلی: während، anstatt، ohne و تفاوت dass و zu.",
        path: "/learn/de-fa/B2/B2-M17-L04"
      }
    ]
  },
  {
    id: "module-18",
    title: "بخش ۱۸: Restriktive Sätze",
    level: "B2",
    lessons: [
      {
        id: "B2-M18-L01",
        title: "außer dass, außer wenn - به جز اینکه",
        description: "یاد بگیرید ساختارهای استثنا: außer dass و außer wenn برای محدودیت.",
        path: "/learn/de-fa/B2/B2-M18-L01"
      },
      {
        id: "B2-M18-L02",
        title: "es sei denn - مگر اینکه",
        description: "یاد بگیرید es sei denn برای بیان شرط منفی و استثنا.",
        path: "/learn/de-fa/B2/B2-M18-L02"
      },
      {
        id: "B2-M18-L03",
        title: "nur dass, bloß dass - فقط اینکه",
        description: "یاد بگیرید nur dass (رسمی) و bloß dass (محاوره‌ای) برای استثنای جزئی.",
        path: "/learn/de-fa/B2/B2-M18-L03"
      },
      {
        id: "B2-M18-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل جملات محدودکننده: außer، es sei denn، nur dass و کاربرد هرکدام.",
        path: "/learn/de-fa/B2/B2-M18-L04"
      }
    ]
  },
  {
    id: "module-19",
    title: "بخش ۱۹: Wissenschaftssprache",
    level: "B2",
    lessons: [
      {
        id: "B2-M19-L01",
        title: "Nominalisierungen - اسمی‌سازی",
        description: "یاد بگیرید اسمی‌سازی پیشرفته برای نوشتار علمی: -ung، -heit، -keit.",
        path: "/learn/de-fa/B2/B2-M19-L01"
      },
      {
        id: "B2-M19-L02",
        title: "Unpersönliche Strukturen - ساختارهای غیرشخصی",
        description: "یاد بگیرید ساختارهای غیرشخصی: es wird angenommen، man-Konstruktionen.",
        path: "/learn/de-fa/B2/B2-M19-L02"
      },
      {
        id: "B2-M19-L03",
        title: "Redemittel - عبارات کاربردی",
        description: "یاد بگیرید عبارات علمی: daraus folgt، zusammenfassend lässt sich sagen.",
        path: "/learn/de-fa/B2/B2-M19-L03"
      },
      {
        id: "B2-M19-L04",
        title: "Zusammenfassung - جمع‌بندی",
        description: "مرور کامل زبان علمی: اسمی‌سازی، ساختارهای غیرشخصی و عبارات کاربردی.",
        path: "/learn/de-fa/B2/B2-M19-L04"
      }
    ]
  },
  {
    id: "module-20",
    title: "بخش ۲۰: B2 Abschluss",
    level: "B2",
    lessons: [
      {
        id: "B2-M20-L01",
        title: "Komplexe Satzstrukturen - ساختارهای پیچیده جمله",
        description: "مرور تمام انواع جملات پیرو: زمانی، علّی، تضادی، نتیجه‌ای، هدفی، شرطی.",
        path: "/learn/de-fa/B2/B2-M20-L01"
      },
      {
        id: "B2-M20-L02",
        title: "Stilistik - سبک‌شناسی",
        description: "یاد بگیرید تفاوت سطوح زبان: رسمی، غیررسمی، علمی و محاوره‌ای.",
        path: "/learn/de-fa/B2/B2-M20-L02"
      },
      {
        id: "B2-M20-L03",
        title: "Textproduktion - تولید متن",
        description: "یاد بگیرید نوشتن متن منسجم با ساختار مقدمه، بدنه و نتیجه.",
        path: "/learn/de-fa/B2/B2-M20-L03"
      },
      {
        id: "B2-M20-L04",
        title: "Prüfungsvorbereitung - آمادگی آزمون",
        description: "مرور جامع و راهبردهای آزمون B2 گوته و telc.",
        path: "/learn/de-fa/B2/B2-M20-L04"
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
const MODULE_DATA: Record<string, { A1: ModuleStub[]; A2: ModuleStub[]; B1: ModuleStub[]; B2: ModuleStub[] }> = {
  'de-fa': {
    A1: DE_FA_A1_MODULES,
    A2: DE_FA_A2_MODULES,
    B1: DE_FA_B1_MODULES,
    B2: DE_FA_B2_MODULES,
  },
  'en-fa': {
    A1: EN_FA_A1_MODULES,
    A2: EN_FA_A2_MODULES,
    B1: [],
    B2: [],
  },
};

/**
 * Get all modules for a specific language pair
 */
export function getAllModulesForLanguage(languagePair: string): { A1: ModuleStub[]; A2: ModuleStub[]; B1: ModuleStub[]; B2: ModuleStub[] } {
  return MODULE_DATA[languagePair] || { A1: [], A2: [], B1: [], B2: [] };
}

/**
 * Get modules for a specific language pair and level
 */
export function getModulesForLevel(languagePair: string, level: 'A1' | 'A2' | 'B1' | 'B2'): ModuleStub[] {
  return MODULE_DATA[languagePair]?.[level] || [];
}

// Backward compatibility exports (for existing code that imports these directly)
export const A1_MODULES = DE_FA_A1_MODULES;
export const A2_MODULES = DE_FA_A2_MODULES;
export const B1_MODULES = DE_FA_B1_MODULES;
export const B2_MODULES = DE_FA_B2_MODULES;
