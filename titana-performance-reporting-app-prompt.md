# پرامپت ساخت نمونه اپلیکیشن مرجع گزارش‌های پرفورمنس مارکتینگ تیتانا

## نقش و مأموریت

تو در نقش یک تیم ارشد متشکل از **Product Designer، UX Architect، Senior Front-end Engineer، Analytics Engineer و Performance Marketing Lead** عمل می‌کنی.

ماموریت تو ساخت یک **نمونه اپلیکیشن کامل، حرفه‌ای، قابل‌کلیک و از نظر فرانت‌اند نزدیک به محصول نهایی** برای تیتانا است. هدف این نمونه، ساخت خود AI Agent یا اتصال واقعی همه سرویس‌ها نیست؛ هدف این است که مهندس AI Agent سازمان با دیدن و کارکردن با اپ، بدون هیچ ابهامی متوجه شود که یک پرفورمنس مارکتر در محصول نهایی:

- چه گزارش‌هایی لازم دارد؛
- گزارش‌ها با چه معماری و سلسله‌مراتبی سازمان‌دهی می‌شوند؛
- هر گزارش چه KPI، نمودار، جدول، فیلتر، Drill-down و وضعیت داده‌ای دارد؛
- مسیر کاربر از مشاهده مسئله تا تحلیل و اقدام چگونه است؛
- AI Agent در آینده از کجا و با چه Context/Payloadی وارد جریان می‌شود.

این نمونه باید **واقعاً کار کند**: مسیرها، منوها، فیلترها، تب‌ها، باز و بسته شدن شاخه‌ها، صفحات گزارش، Drill-downها، حالت‌های Loading/Empty/Error/Disconnected و پنل ارسال Context به Agent باید قابل تعامل باشند. از ساخت یک Landing Page، مجموعه‌ای از کارت‌های تزئینی یا Prototype ایستا خودداری کن.

---

## اصول قطعی محصول

1. مخاطب اصلی اپ: **Performance Marketer تیتانا**.
2. دامنه فقط شامل حوزه‌هایی است که بر جذب، تبدیل، درآمد، سودآوری، Retention یا تصمیم‌های پرفورمنس اثر دارند؛ واحدهای نامرتبط سازمانی را وارد نکن.
3. ساختار اصلی: **حوزه کسب‌وکار ← زیرشاخه ← خانواده گزارش ← گزارش ← جزئیات/Drill-down**.
4. مدل دسترسی: **ترکیبی**؛ یک نمای مدیریتی مشترک وجود دارد، اما جزئیات بر اساس نقش و مجوز نمایش داده می‌شود.
5. داده‌های نسخه نمایشی: **ساختگی اما واقع‌نما و سازگار**؛ همه‌جا برچسب واضح `Demo Data` داشته باشند.
6. صفحه گزارش‌ها بر اساس نوع گزارش، پویا باشد: Executive، Analytical یا Operational.
7. این پروژه AI Agent واقعی را پیاده‌سازی نمی‌کند. فقط نقاط اتصال، تجربه کاربری و قرارداد Context مورد انتظار از Agent را نمایش می‌دهد.
8. اگر مخزن موجود است، ابتدا Stack، Design System، ساختار مسیرها و Componentهای فعلی را بررسی کن و با همان‌ها ادامه بده. چیزی را بدون دلیل بازنویسی نکن.
9. هیچ عدد واقعی، اتصال زنده یا قابلیت اجرایی را جعل نکن. وضعیت منابع باید صادقانه و قابل مشاهده باشد.

---

## معماری اطلاعات مورد نیاز

### ۱. مدیریت رشد و نمای اجرایی

این حوزه تصویر کلان مشترک میان مدیر، مدیر مارکتینگ و پرفورمنس مارکتر را نشان می‌دهد.

- Executive Growth Cockpit
- Marketing P&L Summary
- Revenue, Spend, Profit and POAS Overview
- Budget Pacing and Target Attainment
- Channel Contribution and Mix
- Forecast vs Actual
- Critical Alerts and Anomalies
- Data Health and Freshness Summary

### ۲. دیجیتال مارکتینگ

این حوزه باید دقیقاً شش شاخه مستقل داشته باشد:

#### الف) داشبورد مدیریتی مارکتینگ

- Marketing Overview
- Acquisition and Conversion Summary
- Channel Mix
- Budget Allocation
- Target vs Actual
- Weekly/Monthly Business Review
- Marketing Anomalies and Recommended Investigations

#### ب) پرفورمنس مارکتینگ

- Daily Performance Control
- Channel Performance
- Campaign / Ad Set / Ad Performance
- Spend and Budget Pacing
- ROAS, POAS, CAC and CPA
- Conversion Funnel
- Attribution Comparison: First Touch، Last Touch و Data-driven
- Audience and Placement Performance
- Geography, Device and Time Performance
- Landing Page Performance
- Creative Performance and Fatigue
- Lead Quality by Source
- E-commerce Revenue Attribution
- Alerts, Wasted Spend and Optimization Opportunities

#### ج) SEO

- Organic Performance Overview
- Organic Traffic and Conversion
- Keyword and Query Performance
- Landing Page SEO Performance
- Brand vs Non-brand Search
- Content Performance
- Technical SEO Health
- Indexing, Crawl and Core Web Vitals
- Organic Revenue and Assisted Conversion

#### د) Social Media

- Cross-platform Social Overview
- Content and Post Performance
- Reach, Engagement and Video Performance
- Audience/Follower Growth
- Paid vs Organic Social
- Social Traffic and Assisted Conversion
- Community Response and Sentiment Summary

#### هـ) تبلیغات و Creative

- Creative Library and Performance
- Creative Comparison
- Hook, Format, Message and CTA Performance
- Creative Fatigue
- Placement and Audience Interaction
- Winning / Losing Creative Patterns
- Production Pipeline Status

#### و) CRO و Landing Page

- Landing Page Scorecard
- Page-to-conversion Funnel
- Form and Checkout Drop-off
- Device and Speed Impact
- A/B Test Results
- Experiment Backlog
- Conversion Opportunities and Friction Points

### ۳. فروش و CRM

- Lead-to-Sale Pipeline
- Lead Volume and Quality by Source
- MQL, SQL and Won Conversion
- Speed-to-Lead
- Sales Cycle Duration
- Pipeline Value and Forecast
- Lost Reasons
- Campaign-to-CRM Reconciliation
- Sales Team/Owner Performance where permitted

### ۴. محصول و E-commerce

- E-commerce Funnel: View → Product → Cart → Checkout → Purchase
- Product and Category Performance
- Revenue, Quantity and Conversion by SKU
- Cart Abandonment
- Checkout Failure
- Discount and Promotion Performance
- Refund, Cancellation and Return
- Cross-sell and Basket Analysis
- Landing Page to Product Journey

### ۵. مالی و سودآوری

- Revenue Reconciliation across Analytics, Orders and Accounting
- Marketing Profitability
- Contribution Margin
- POAS and Profit by Channel/Campaign
- CAC vs LTV
- Unit Economics
- Discount, Refund and Shipping Impact
- Budget Burn and Forecast
- Data Variance and Reconciliation Exceptions

### ۶. موجودی و تأمین برای مارکتینگ

- Stock-aware Marketing Overview
- In-stock / Out-of-stock Impact on Campaigns
- Inventory Coverage and Days of Stock
- Fast / Slow Movers
- Campaign Readiness by Product
- Demand vs Inventory
- Lost Revenue from Stockout
- Products That Should Not Receive Ad Spend

### ۷. مشتری و Retention

- Retention Overview
- Cohort Analysis
- Repeat Purchase Rate
- RFM Segmentation
- New vs Returning Customers
- Churn and Reactivation
- LTV by Acquisition Source
- Loyalty / Customer Club Performance
- Retention Campaign Performance

---

## ساختار رابط کاربری

### Navigation اصلی

- نوار بالای ثابت: خانه، گزارش‌ها، ایجنت‌ها، اپلیکیشن‌ها.
- صفحه Home نباید مملو از Analytics باشد؛ فقط Launchpad برای ورود سریع به حوزه‌ها، گزارش‌های اخیر، هشدارهای مهم و Agentها باشد.
- در بخش گزارش‌ها یک **درخت ناوبری سمت راست در حالت RTL** نمایش بده:
  - حوزه؛
  - زیرشاخه؛
  - خانواده گزارش؛
  - تعداد گزارش و وضعیت دسترسی.
- Breadcrumb همیشه محل کاربر را نشان دهد.
- جست‌وجوی سراسری باید Report، KPI، Dimension و Source را پیدا کند.
- نقش نمایشی قابل تعویض باشد: مدیر ارشد، مدیر مارکتینگ و پرفورمنس مارکتر؛ تغییر نقش، میزان جزئیات و دسترسی را تغییر دهد.

### صفحه فهرست هر زیرشاخه

- عنوان، توضیح کوتاه و هدف تصمیم‌گیری؛
- KPIهای کلیدی؛
- خانواده‌های گزارش با دسته‌بندی روشن؛
- کارت گزارش شامل نام، سؤال تصمیم‌گیری، مخاطب، Cadence، منابع، Freshness و وضعیت؛
- فیلتر تاریخ و Compare Period؛
- Favorite، Recent و Pin؛
- برچسب‌های `Demo Data`، `Disconnected`، `Delayed`، `Ready` و `Needs Mapping`؛
- امکان باز کردن Report Detail.

### سه قالب پویا برای صفحه گزارش

#### Executive

- ۴ تا ۶ KPI اصلی؛
- روند و مقایسه با هدف/دوره قبل؛
- عوامل اثرگذار؛
- هشدارهای محدود اما مهم؛
- خلاصه قابل فهم و لینک به جزئیات.

#### Analytical

- KPIها، نمودارهای چندبعدی، Breakdown، Segment، مقایسه و توضیح تعریف KPI؛
- Drill-down از Channel به Campaign، Ad Set، Ad و Creative؛
- جدول قابل مرتب‌سازی و فیلتر؛
- Annotation روی رخدادها و کمپین‌ها؛
- نمایش Attribution Model فعال.

#### Operational

- موارد نیازمند اقدام در اولویت؛
- Severity، Owner، Deadline و Status؛
- هشدار، علت احتمالی، شواهد و اقدام پیشنهادی؛
- امکان ساخت Task نمایشی و ارسال Context به Agent.

### اجزای مشترک Report Detail

- عنوان، توضیح و سؤال تصمیم‌گیری؛
- بازه زمانی، مقایسه، فیلتر و Saved View؛
- KPI Card همراه Definition و Formula؛
- نمودار مناسب، Legend قابل کنترل و Tooltip؛
- جدول جزئیات و Drill-down؛
- Insights/Anomalies؛
- Data Sources، Last Sync، Freshness و Quality Status؛
- Owner و Cadence؛
- Export نمایشی PDF/Excel؛
- Share/Copy Link؛
- دکمه `تحلیل با AI Agent`.

---

## قرارداد داده و KPI

برای هر KPI و گزارش یک Metadata/Contract قابل مشاهده بساز:

- نام فارسی و انگلیسی؛
- تعریف کسب‌وکاری؛
- فرمول دقیق و واحد؛
- Inclusion/Exclusion؛
- Source System؛
- Grain؛
- Join Key؛
- Event Time، Timezone و Freshness؛
- Dimensions و Filters؛
- Deduplication و Missing-data Rule؛
- Owner؛
- Validation Status؛
- Lineage: Source → Normalize → Aggregate → Visible Card.

منابع نمونه می‌توانند شامل GA4، GTM، Google Ads، Meta Ads، TikTok Ads، Search Console، CRM، Backend Orders، Accounting، WMS/Inventory، PostHog، BigQuery و ELT/dbt باشند. اتصال زنده را ادعا نکن؛ برای هر منبع یکی از وضعیت‌های Connected Demo، Disconnected، Delayed، Mapping Required یا Error را نشان بده.

فیلترهای مشترک: تاریخ، Compare Period، Channel، Source/Medium، Campaign، Ad Set، Ad، Creative، Landing Page، Device، Geography، Product، Category، Customer Segment، New/Returning و Attribution Model.

---

## تجربه مورد انتظار برای AI Agent آینده

AI Agent را نساز. یک Drawer یا Side Panel نمایشی ایجاد کن که با کلیک روی `تحلیل با AI Agent` باز شود و نشان دهد در آینده چه Contextی ارسال خواهد شد:

```json
{
  "business_id": 107,
  "user_role": "performance_marketer",
  "department": "digital_marketing",
  "report_id": "daily_performance_control",
  "time_range": {},
  "active_filters": {},
  "selected_kpis": [],
  "selected_chart_point": {},
  "anomalies": [],
  "data_freshness": {},
  "source_status": [],
  "user_question": ""
}
```

در این پنل موارد زیر دیده شود:

- خلاصه Context قابل ارسال؛
- سؤال‌های پیشنهادی مثل «علت افت ROAS چیست؟»؛
- محل تایپ سؤال؛
- انتخاب نوع خروجی: تحلیل، توضیح، پیشنهاد اقدام یا ساخت Task؛
- پیام روشن: «Agent در این Prototype متصل نیست»؛
- نمونه پاسخ ساختگی با برچسب Demo، فقط برای نمایش تجربه آینده.

---

## طراحی بصری

- فارسی و RTL در اولویت، با آمادگی کامل برای English/LTR؛
- سبک Premium و Apple-inspired: فضای سفید زیاد، کارت‌های سفید روی پس‌زمینه خاکستری روشن، عمق ظریف، گوشه‌های نرم و حرکت‌های روان؛
- رنگ Accent محدود و هدفمند؛
- Liquid Glass فقط در نقاط منتخب، نه روی تمام صفحه؛
- آیکون‌های یکدست و خوانا؛
- Typography فارسی حرفه‌ای با Vazirmatn/Vazir در صورت دسترسی؛
- Responsive برای Desktop، Tablet و Mobile؛
- دسترس‌پذیری: Contrast، Keyboard Navigation، Focus State، Label و Reduced Motion؛
- نمودارها نباید فقط با رنگ معنا را منتقل کنند.

---

## داده Demo و سناریوها

یک Dataset ساختگی اما منسجم بساز که حداقل این سناریوها را نمایش دهد:

1. افت ROAS یک کانال به‌دلیل افزایش هزینه و کاهش Conversion Rate؛
2. اختلاف درآمد GA4 با Backend Orders؛
3. Creative Fatigue در یک کمپین؛
4. افت Checkout Conversion در Mobile؛
5. کمپین فعال برای محصول کم‌موجودی؛
6. Segment با LTV بالا اما بودجه جذب پایین؛
7. منبعی با تأخیر Sync یا Mapping ناقص.

اعداد بین کارت‌ها، نمودارها و جداول باید با هم سازگار باشند. Demo بودن داده‌ها را در Header و Tooltip توضیح بده.

---

## مسیرهای الزامی قابل‌کلیک

حداقل این Flowها را انتهابه‌انتها بساز:

1. ورود به گزارش‌ها → دیجیتال مارکتینگ → پرفورمنس → Daily Performance Control → Channel → Campaign → Ad/Creative.
2. هشدار افت ROAS → مشاهده شواهد → تغییر Attribution/Filter → باز کردن پنل Agent.
3. گزارش Revenue Reconciliation → مشاهده اختلاف منابع → Drill-down سفارش‌ها.
4. گزارش Stock-aware Marketing → شناسایی محصول کم‌موجودی با هزینه تبلیغاتی فعال.
5. گزارش RFM → انتخاب Segment → مشاهده Acquisition Source و LTV.
6. تغییر نقش از مدیر به پرفورمنس مارکتر و مشاهده تغییر سطح جزئیات.
7. مشاهده حالت‌های Loading، Empty، Error، Disconnected و Permission Denied.

هیچ CTA اصلی نباید Dead باشد. اگر عملیاتی واقعی نیست، Modal/Toast/Drawer نمایشی مناسب باز کند و محدودیت را صریح بگوید.

---

## الزامات فنی و خروجی

- از Stack موجود Repository استفاده کن؛ اگر پروژه‌ای وجود ندارد، یک Front-end مدرن و Component-based با TypeScript بساز.
- از داده Mock ساختاریافته و قابل تعویض با API استفاده کن؛ داده را داخل JSX پراکنده نکن.
- Navigation و URL State واقعی باشند تا هر Report لینک مستقل داشته باشد.
- Components قابل استفاده مجدد باشند: DepartmentTree، ReportCard، KPI Card، FilterBar، ChartPanel، DataStatus، InsightCard، DrilldownTable و AgentContextDrawer.
- برای Chartها، Tableها و Responsive Layout نمونه واقعی بساز.
- Typeها و Interfaceهای Report، KPI، DataSource، Alert، Filter و AgentContext را تعریف کن.
- یک README تهیه کن که معماری، اجرای پروژه، مسیرها، Mock Data و نقاط اتصال آینده به API/Agent را توضیح دهد.
- یک `REPORT_CATALOG.md` تولید کن که تمام حوزه‌ها، زیرشاخه‌ها و گزارش‌های پیاده‌شده/نمایشی را فهرست کند.
- یک `DATA_CONTRACTS.md` با نمونه Contract برای KPIهای اصلی ایجاد کن.
- تست Build/Lint را اجرا و خطاها را برطرف کن.

---

## ترتیب اجرا

1. Repository و Design System موجود را Audit کن.
2. IA و Route Map را مکتوب کن.
3. Modelهای Report/KPI/Source/AgentContext و Mock Dataset را بساز.
4. App Shell، Navigation و Department Tree را پیاده کن.
5. سه Report Template پویا را بساز.
6. هفت حوزه و شش شاخه دیجیتال مارکتینگ را با Catalog کامل نمایش بده.
7. Flowهای الزامی و Stateهای مختلف را کامل کن.
8. Responsive و Accessibility را بررسی کن.
9. README، Report Catalog و Data Contracts را تکمیل کن.
10. Build و Lint را اجرا کن و نتیجه نهایی را همراه تصاویر صفحات کلیدی گزارش بده.

قبل از شروع پیاده‌سازی فقط در صورتی سؤال بپرس که پاسخ آن واقعاً معماری را تغییر می‌دهد. در غیر این صورت، فرضیات منطقی را در README ثبت کن و کار را تا یک خروجی کامل ادامه بده.

---

## معیار پذیرش

خروجی زمانی کامل است که:

- تمام هفت حوزه و زیرشاخه‌های مرتبط در Navigation وجود داشته باشند؛
- شش شاخه دیجیتال مارکتینگ دقیقاً قابل مشاهده باشند؛
- Report Catalog جامع و قابل جست‌وجو باشد؛
- حداقل مسیرهای الزامی واقعاً قابل‌کلیک باشند؛
- هر گزارش هدف تصمیم‌گیری، KPI، Source، Freshness و Drill-down داشته باشد؛
- قالب صفحه متناسب با Executive/Analytical/Operational تغییر کند؛
- مدل دسترسی ترکیبی به شکل قابل مشاهده شبیه‌سازی شود؛
- داده‌های Demo منسجم و صریحاً برچسب‌گذاری شده باشند؛
- پنل Agent فقط نیاز و قرارداد اتصال آینده را نشان دهد و ادعای Agent واقعی نکند؛
- تمام Stateهای Loading/Empty/Error/Disconnected/Permission نمایش داده شوند؛
- UI از نظر RTL، Responsive، Accessibility و کیفیت بصری آماده ارائه به مهندس سازمان باشد؛
- هیچ صفحه اصلی یا CTA حیاتی ناقص، خالی یا مبهم باقی نماند.

در پایان، علاوه بر کد، یک گزارش کوتاه ارائه کن که مشخص کند چه بخش‌هایی ساخته شده، چه فرض‌هایی در نظر گرفته شده، کدام اتصال‌ها Mock هستند و مهندس AI Agent برای اتصال واقعی باید از چه Contractهایی استفاده کند.
