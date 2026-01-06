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
      }
      // Add more lessons here as content JSON files are created
    ]
  }
  // Add more modules here as lessons are created
];

// A2 modules - add when content is created
export const A2_MODULES: ModuleStub[] = [];
