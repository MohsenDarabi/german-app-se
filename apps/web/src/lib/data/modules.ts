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

// Only include lessons that have actual content files in content/de-fa/
// Add new lessons here as they are created from content fusion

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
      }
    ]
  }
];

// A2 modules - add when content is created
export const A2_MODULES: ModuleStub[] = [];
