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

export const A1_MODULES: ModuleStub[] = [
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
      }
      // More lessons will be added as they are created from content fusion
    ]
  },
  {
    id: "module-02",
    title: "بخش ۲: خانواده من (Meine Familie)",
    level: "A1",
    lessons: [
      {
        id: "A1-1-M02-L03",
        title: "اعضای خانواده (Familienmitglieder)",
        description: "پدر، مادر، خواهر و برادر.",
        path: "/learn/de-fa/A1/A1-1-M02-L03"
      },
      {
        id: "A1-1-M02-L04",
        title: "معرفی خانواده (Familienvorstellen)",
        description: "معرفی اعضای خانواده.",
        path: "/learn/de-fa/A1/A1-1-M02-L04"
      },
      {
        id: "A1-1-M02-L05",
        title: "این کیست؟ (Wer ist das?)",
        description: "پرسیدن درباره افراد و ضمایر ملکی.",
        path: "/learn/de-fa/A1/A1-1-M02-L05"
      }
    ]
  },
  {
    id: "module-03",
    title: "بخش ۳: غذا و نوشیدنی (Essen & Trinken)",
    level: "A1",
    lessons: [
      {
        id: "A1-1-M03-L06",
        title: "در کافه (Im Café)",
        description: "سفارش دادن قهوه و کیک.",
        path: "/learn/de-fa/A1/A1-1-M03-L06"
      },
      {
        id: "A1-1-M03-L07",
        title: "میوه‌ها و سبزیجات (Obst & Gemüse)",
        description: "واژگان مربوط به خرید.",
        path: "/learn/de-fa/A1/A1-1-M03-L07"
      },
      {
        id: "A1-1-M03-L08",
        title: "در رستوران (Im Restaurant)",
        description: "سفارش غذا.",
        path: "/learn/de-fa/A1/A1-1-M03-L08"
      }
    ]
  },
  {
    id: "module-04",
    title: "بخش ۴: زمان و برنامه روزانه (Zeit & Routine)",
    level: "A1",
    lessons: [
      {
        id: "A1-2-M04-L07",
        title: "ساعت چند است؟ (Uhrzeit)",
        description: "پرسیدن و گفتن زمان.",
        path: "/learn/de-fa/A1/A1-2-M04-L07"
      },
      {
        id: "A1-2-M04-L08",
        title: "برنامه روزانه (Tagesablauf)",
        description: "بیدار شدن، کار کردن، خوابیدن.",
        path: "/learn/de-fa/A1/A1-2-M04-L08"
      },
      {
        id: "A1-2-M04-L09",
        title: "روزهای هفته (Wochentage)",
        description: "روزهای هفته و برنامه‌ریزی.",
        path: "/learn/de-fa/A1/A1-2-M04-L09"
      },
      {
        id: "A1-2-M04-L10",
        title: "قرار ملاقات (Termine)",
        description: "تنظیم قرار ملاقات.",
        path: "/learn/de-fa/A1/A1-2-M04-L10"
      },
      {
        id: "A1-2-M04-L11",
        title: "عادات روزانه (Gewohnheiten)",
        description: "صحبت درباره عادات.",
        path: "/learn/de-fa/A1/A1-2-M04-L11"
      }
    ]
  },
  {
    id: "module-05",
    title: "بخش ۵: اوقات فراغت (Freizeit)",
    level: "A1",
    lessons: [
      {
        id: "A1-2-M05-L09",
        title: "سرگرمی‌ها (Hobbys)",
        description: "صحبت درباره علایق و سرگرمی‌ها.",
        path: "/learn/de-fa/A1/A1-2-M05-L09"
      },
      {
        id: "A1-2-M05-L10",
        title: "ورزش (Sport)",
        description: "صحبت درباره ورزش.",
        path: "/learn/de-fa/A1/A1-2-M05-L10"
      },
      {
        id: "A1-2-M05-L11",
        title: "آخر هفته (Wochenende)",
        description: "برنامه‌ریزی برای تعطیلات.",
        path: "/learn/de-fa/A1/A1-2-M05-L11"
      },
      {
        id: "A1-2-M05-L12",
        title: "موسیقی و فیلم (Musik & Film)",
        description: "صحبت درباره موسیقی و فیلم.",
        path: "/learn/de-fa/A1/A1-2-M05-L12"
      },
      {
        id: "A1-2-M05-L13",
        title: "سفر (Reisen)",
        description: "برنامه‌ریزی سفر.",
        path: "/learn/de-fa/A1/A1-2-M05-L13"
      }
    ]
  },
  {
    id: "module-06",
    title: "بخش ۶: در شهر (In der Stadt)",
    level: "A1",
    lessons: [
      {
        id: "A1-2-M06-L11",
        title: "مکان‌ها در شهر (Orte in der Stadt)",
        description: "فروشگاه‌ها، رستوران‌ها و...",
        path: "/learn/de-fa/A1/A1-2-M06-L11"
      },
      {
        id: "A1-2-M06-L12",
        title: "آدرس پرسیدن (Nach dem Weg fragen)",
        description: "پیدا کردن مکان‌ها و جهت‌ها.",
        path: "/learn/de-fa/A1/A1-2-M06-L12"
      },
      {
        id: "A1-1-M06-L13",
        title: "حمل و نقل (Verkehrsmittel)",
        description: "وسایل حمل و نقل.",
        path: "/learn/de-fa/A1/A1-1-M06-L13"
      },
      {
        id: "A1-1-M06-L14",
        title: "بلیت خریدن (Fahrkarten kaufen)",
        description: "خرید بلیت حمل و نقل.",
        path: "/learn/de-fa/A1/A1-1-M06-L14"
      },
      {
        id: "A1-1-M06-L15",
        title: "مسیریابی (Wegbeschreibung)",
        description: "توضیح دادن مسیر.",
        path: "/learn/de-fa/A1/A1-1-M06-L15"
      }
    ]
  }
];

export const A2_MODULES: ModuleStub[] = [
  {
    id: "module-07",
    title: "بخش ۷: سفر و تجربه‌ها (Reisen & Erlebnisse)",
    level: "A2",
    lessons: [
      {
        id: "A2-1-M07-L01",
        title: "تجربه‌های سفر (Urlaubserlebnisse)",
        description: "صحبت درباره تعطیلات با زمان Perfekt.",
        path: "/learn/de-fa/A2/A2-1-M07-L01"
      },
      {
        id: "A2-1-M07-L02",
        title: "سفر با تاخیر (Reise mit Verspätung)",
        description: "صحبت درباره مشکلات سفر و Perfekt با sein.",
        path: "/learn/de-fa/A2/A2-1-M07-L02"
      }
    ]
  },
  {
    id: "module-08",
    title: "بخش ۸: کار و شغل (Arbeit & Beruf)",
    level: "A2",
    lessons: [
      {
        id: "A2-1-M08-L03",
        title: "شغل من (Mein Beruf)",
        description: "توصیف مشاغل و فعالیت‌های کاری.",
        path: "/learn/de-fa/A2/A2-1-M08-L03"
      },
      {
        id: "A2-1-M08-L04",
        title: "در دفتر (Im Büro)",
        description: "واژگان دفتر و ارتباطات کاری.",
        path: "/learn/de-fa/A2/A2-1-M08-L04"
      }
    ]
  },
  {
    id: "module-09",
    title: "بخش ۹: سلامتی (Gesundheit)",
    level: "A2",
    lessons: [
      {
        id: "A2-1-M09-L05",
        title: "پیش دکتر (Beim Arzt)",
        description: "توصیف علائم و ویزیت پزشک.",
        path: "/learn/de-fa/A2/A2-1-M09-L05"
      },
      {
        id: "A2-1-M09-L06",
        title: "زندگی سالم (Gesund leben)",
        description: "صحبت درباره سبک زندگی سالم.",
        path: "/learn/de-fa/A2/A2-1-M09-L06"
      }
    ]
  },
  {
    id: "module-10",
    title: "بخش ۱۰: اوقات فراغت و سرگرمی (Freizeit & Hobbys)",
    level: "A2",
    lessons: [
      {
        id: "A2-2-M10-L07",
        title: "اوقات فراغت من (Meine Freizeit)",
        description: "صحبت درباره سرگرمی‌ها و ترجیحات.",
        path: "/learn/de-fa/A2/A2-2-M10-L07"
      },
      {
        id: "A2-2-M10-L08",
        title: "برنامه‌های آخر هفته (Wochenendpläne)",
        description: "برنامه‌ریزی و زمان آینده.",
        path: "/learn/de-fa/A2/A2-2-M10-L08"
      }
    ]
  },
  {
    id: "module-11",
    title: "بخش ۱۱: رسانه و تکنولوژی (Medien & Technik)",
    level: "A2",
    lessons: [
      {
        id: "A2-2-M11-L09",
        title: "اینترنت و موبایل (Internet & Handy)",
        description: "صحبت درباره تکنولوژی و مقایسه.",
        path: "/learn/de-fa/A2/A2-2-M11-L09"
      },
      {
        id: "A2-2-M11-L10",
        title: "اخبار و رسانه (Nachrichten & Medien)",
        description: "صحبت درباره اخبار و رسانه‌ها.",
        path: "/learn/de-fa/A2/A2-2-M11-L10"
      }
    ]
  },
  {
    id: "module-12",
    title: "بخش ۱۲: جشن‌ها و مراسم (Feste & Feiern)",
    level: "A2",
    lessons: [
      {
        id: "A2-2-M12-L11",
        title: "دعوت‌نامه‌ها (Einladungen)",
        description: "نوشتن و پاسخ به دعوت‌نامه.",
        path: "/learn/de-fa/A2/A2-2-M12-L11"
      },
      {
        id: "A2-2-M12-L12",
        title: "جشن‌های آلمانی (Deutsche Feste)",
        description: "آشنایی با جشن‌ها و سنت‌های آلمانی.",
        path: "/learn/de-fa/A2/A2-2-M12-L12"
      }
    ]
  }
];