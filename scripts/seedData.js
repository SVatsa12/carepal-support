// Synthetic demo data for CarePal Support. Every person, phone number and ticket here is made up.
//
// Times are written as "how long ago" strings ("2d3h", "45m") relative to the moment the seed runs,
// so the demo always shows fresh wait timers. Ticket derived fields (unread counters, wait timer,
// last message) are computed from these messages in seed.js, never hand-written.

export const DEMO_DOMAIN = "demo.carepal.test";

export const STAFF = [
  { key: "anjali", name: "Anjali Rao", role: "admin", phone: "+91 90000 00101", city: "Bengaluru" },
  { key: "rohit", name: "Rohit Menon", role: "agent", phone: "+91 90000 00102", city: "Bengaluru" },
  { key: "meera", name: "Meera Iyer", role: "agent", phone: "+91 90000 00103", city: "Chennai" },
];

export const MEMBERS = [
  {
    key: "priya",
    name: "Priya Sharma",
    city: "Bengaluru",
    careType: "Dementia care – mother, 74",
    phone: "+91 90000 00201",
  },
  {
    key: "arjun",
    name: "Arjun Mehta",
    city: "Pune",
    careType: "Elderly care – father, 78",
    phone: "+91 90000 00202",
  },
  {
    key: "kavya",
    name: "Kavya Reddy",
    city: "Hyderabad",
    careType: "Baby care – newborn",
    phone: "+91 90000 00203",
  },
  {
    key: "rahul",
    name: "Rahul Verma",
    city: "Delhi NCR",
    careType: "Post-surgery recovery – knee replacement",
    phone: "+91 90000 00204",
  },
  {
    key: "lakshmi",
    name: "Lakshmi Narayanan",
    city: "Chennai",
    careType: "Elderly care – father, 82",
    phone: "+91 90000 00205",
  },
  {
    key: "sneha",
    name: "Sneha Kulkarni",
    city: "Mumbai",
    careType: "Post-hospital recovery – father, stroke rehab",
    phone: "+91 90000 00206",
  },
  {
    key: "vikram",
    name: "Vikram Singh",
    city: "Delhi NCR",
    careType: "Dementia care – grandmother, 86",
    phone: "+91 90000 00207",
  },
  {
    key: "ananya",
    name: "Ananya Das",
    city: "Bengaluru",
    careType: "Baby care – twins, 3 months",
    phone: "+91 90000 00208",
  },
];

// ---------- Message helpers ----------

/** Member message. */
const m = (ago, text) => ({ kind: "member", ago, text });
/** Staff message from `staffKey`. */
const s = (staffKey, ago, text) => ({ kind: "staff", staffKey, ago, text });
/** System message caused by `staffKey`. */
const sys = (staffKey, ago, text) => ({ kind: "system", staffKey, ago, text });

// ---------- Tickets ----------
// memberRead / staffRead: true simulates that side having already opened the thread
// (their unread counter is 0 even if the other side wrote last).

export const TICKETS = [
  // ----- Priya Sharma (demo member): 4 tickets -----
  {
    member: "priya",
    category: "late_nurse",
    priority: "urgent",
    status: "in_progress",
    assignee: "rohit",
    createdAgo: "50m",
    subject: "Nurse Kavitha hasn't arrived for the 8 AM shift",
    description:
      "Nurse Kavitha hasn't arrived for the 8 AM shift, mother needs her morning medication. She gets anxious when her routine changes.",
    messages: [
      sys("anjali", "48m", "Assigned to Rohit"),
      sys("rohit", "47m", "Rohit changed status to In progress"),
      s(
        "rohit",
        "45m",
        "Sorry about this, Priya. I've called Kavitha — she's stuck in traffic near Silk Board, ETA 25 minutes. I'll update you once she checks in.",
      ),
      m(
        "40m",
        "Thank you. Can someone tell me which tablet is the morning one? The strip labels have faded.",
      ),
      s(
        "rohit",
        "20m",
        "Kavitha has just checked in at your home and is giving the morning dose now.",
      ),
      s(
        "rohit",
        "18m",
        "The morning tablet is the small white one (Donepezil). Kavitha will relabel all the strips today so this doesn't happen again.",
      ),
    ],
  },
  {
    member: "priya",
    category: "billing",
    priority: "medium",
    status: "pending",
    assignee: "meera",
    createdAgo: "2d5h",
    subject: "October invoice charges 31 days but care was paused for 3",
    description:
      "The invoice for October shows 31 days of care, but care was paused for 3 days (14–16 Oct) while mother stayed with my brother. Please correct it.",
    messages: [
      sys("anjali", "2d4h30m", "Assigned to Meera"),
      s(
        "meera",
        "2d4h",
        "Hi Priya, thanks for flagging this. Could you confirm who you arranged the pause with? I'll raise it with our billing team.",
      ),
      m(
        "2d2h",
        "It was confirmed with our care coordinator Sunil on a call on 12 Oct. I also have his WhatsApp message.",
      ),
      s("meera", "1d20h", "Got it, thank you. I've sent this to billing for review."),
      m("38m", "Any update? The auto-debit for this invoice is due tomorrow."),
    ],
  },
  {
    member: "priya",
    category: "schedule_change",
    priority: "low",
    status: "resolved",
    assignee: "meera",
    createdAgo: "5d2h",
    memberRead: true,
    subject: "Move Saturday's day shift to Sunday",
    description:
      "Please move this Saturday's day shift to Sunday — we have a family function on Saturday and mother will be with us all day.",
    messages: [
      sys("anjali", "5d1h", "Assigned to Meera"),
      s(
        "meera",
        "5d",
        "Hi Priya, happy to help. Same caregiver (Kavitha) on Sunday, 8 AM to 8 PM — does that work?",
      ),
      m("4d23h", "Yes, perfect. Thank you!"),
      s(
        "meera",
        "4d22h",
        "Done — Sunday is confirmed and Saturday is cancelled at no charge. I'm closing this ticket; reply any time if plans change.",
      ),
      sys("meera", "4d21h55m", "Meera changed status to Resolved"),
    ],
  },
  {
    member: "priya",
    category: "care_quality",
    priority: "high",
    status: "pending",
    assignee: null,
    createdAgo: "9m",
    subject: "Night caregiver not following mother's diet chart",
    description:
      "The night caregiver is giving mother sweet tea after 9 PM, even though Dr. Rao's diet chart says no sugar and no caffeine after 6 PM. She can't sleep afterwards.",
    messages: [
      m(
        "7m",
        "She had tea again at 10:30 PM last night. Please make sure the night team has the updated chart.",
      ),
      m("6m", "This has happened three nights in a row now."),
    ],
  },

  // ----- Pending -----
  {
    member: "arjun",
    category: "late_nurse",
    priority: "high",
    status: "pending",
    assignee: null,
    createdAgo: "6m",
    subject: "Caregiver Suresh not here for 7 AM visit",
    description:
      "Caregiver Suresh was supposed to come at 7 AM for father's bath and breakfast. He hasn't come and his phone is switched off.",
    messages: [
      m(
        "4m",
        "Father is diabetic and needs breakfast before his insulin. Please send someone soon.",
      ),
    ],
  },
  {
    member: "kavya",
    category: "app_issue",
    priority: "medium",
    status: "pending",
    assignee: null,
    createdAgo: "47m",
    subject: "Login OTP not arriving",
    description:
      "I'm not receiving the OTP to log in to the CarePal app. I've tried five times since morning on my Jio number.",
    messages: [
      m("45m", "Tried with Wi-Fi off as well, still nothing."),
      m("44m", "I need to check the nanny's schedule for tomorrow."),
    ],
  },
  {
    member: "rahul",
    category: "schedule_change",
    priority: "medium",
    status: "pending",
    assignee: null,
    createdAgo: "2h40m",
    subject: "Move physiotherapy sessions to evenings",
    description:
      "From next week please move father's physiotherapy sessions to evenings (after 5 PM). I'm back in office and want to be home during the sessions.",
    messages: [m("2h35m", "Tuesday, Thursday and Saturday would work best for us.")],
  },
  {
    member: "lakshmi",
    category: "billing",
    priority: "low",
    status: "pending",
    assignee: null,
    createdAgo: "1d6h",
    subject: "GST invoices for August and September",
    description:
      "Could you send GST invoices for August and September? Our CA needs them for the quarterly filing.",
    messages: [
      m("1d5h", "Please send them to the email on my account."),
      m("20h", "Gentle reminder — the filing deadline is this week."),
    ],
  },
  {
    member: "sneha",
    category: "care_quality",
    priority: "urgent",
    status: "pending",
    assignee: null,
    createdAgo: "13m",
    subject: "Father left alone for an hour",
    description:
      "The caregiver left father alone for nearly an hour this afternoon. He's on a walker after his stroke and tried to go to the bathroom by himself.",
    messages: [m("12m", "He's fine but shaken. I need to know this won't happen again.")],
  },
  {
    member: "vikram",
    category: "other",
    priority: "low",
    status: "pending",
    assignee: null,
    createdAgo: "5h20m",
    subject: "Travel companion for grandmother in December",
    description:
      "Does CarePal provide a caregiver who can travel with my grandmother to Lucknow for a week in December?",
    messages: [
      s(
        "anjali",
        "5h",
        "Hi Vikram, yes — we offer travel companions for some cities. Could you share the travel dates and whether it's by train or flight?",
      ),
      m("4h50m", "By train, 18–25 Dec. She uses a wheelchair at stations."),
    ],
  },
  {
    member: "ananya",
    category: "schedule_change",
    priority: "high",
    status: "pending",
    assignee: null,
    createdAgo: "1d22h",
    subject: "Need a female caregiver for night shifts",
    description:
      "We need a female caregiver for night shifts from Monday — the twins' night feeds are getting hard for me to manage alone.",
    messages: [
      m("1d21h", "Ideally someone with newborn experience, 10 PM to 6 AM."),
      m("1d2h", "Hello? Is anyone looking at this?"),
    ],
  },
  {
    member: "rahul",
    category: "app_issue",
    priority: "low",
    status: "pending",
    assignee: null,
    createdAgo: "3h",
    subject: "App shows next visit as unassigned",
    description:
      "The app shows father's next physio visit as 'Unassigned', but the coordinator told me Deepak is coming.",
    messages: [
      s(
        "rohit",
        "2h30m",
        "Hi Rahul, could you tell me which app version you're on (Profile → About)? Does pulling down to refresh change it?",
      ),
    ],
  },

  // ----- In progress -----
  {
    member: "arjun",
    category: "billing",
    priority: "high",
    status: "in_progress",
    assignee: "meera",
    createdAgo: "3d",
    subject: "Charged twice for November advance",
    description:
      "We were charged twice for the November advance — ₹18,400 was debited on 1 Nov and again on 2 Nov.",
    messages: [
      sys("anjali", "2d23h", "Assigned to Meera"),
      sys("meera", "2d22h", "Meera changed status to In progress"),
      s(
        "meera",
        "2d21h55m",
        "Sorry, Arjun. I can see both debits. I've raised a refund with our payments team — refunds take 5–7 working days.",
      ),
      m("2d20h", "Okay, please share the refund reference."),
      s(
        "meera",
        "2d19h",
        "The refund reference is RF-88214. I'll keep this ticket open until it reaches your account.",
      ),
      m("1h5m", "Still not received. It's been almost three days."),
    ],
  },
  {
    member: "kavya",
    category: "late_nurse",
    priority: "high",
    status: "in_progress",
    assignee: "rohit",
    createdAgo: "2h",
    memberRead: true,
    subject: "Nanny late every day this week",
    description:
      "Nanny Shalini has come 30–40 minutes late almost every day this week. I have to leave for work at 9.",
    messages: [
      sys("anjali", "1h55m", "Assigned to Rohit"),
      sys("rohit", "1h50m", "Rohit changed status to In progress"),
      s(
        "rohit",
        "1h48m",
        "Hi Kavya, sorry to hear this. I'm checking Shalini's check-in logs for the week and will call her today.",
      ),
      m("1h40m", "Thanks. Can you also arrange a backup in case she's late tomorrow?"),
      s(
        "rohit",
        "1h30m",
        "Yes — Fatima is on standby for tomorrow at 8:30 AM. If Shalini hasn't checked in by 8:45, Fatima will come instead.",
      ),
    ],
  },
  {
    member: "lakshmi",
    category: "care_quality",
    priority: "medium",
    status: "in_progress",
    assignee: "meera",
    createdAgo: "4d",
    subject: "Caregiver skipping father's evening walk",
    description:
      "The caregiver is not helping father with the evening walk the physiotherapist advised. He's been sitting most of the day.",
    messages: [
      sys("meera", "3d23h", "Assigned to Meera"),
      sys("meera", "3d23h", "Meera changed status to In progress"),
      s(
        "meera",
        "3d22h",
        "Thank you for telling us. I've spoken to Revathi and shared the physio plan again. Our nurse supervisor will visit on Thursday to check.",
      ),
      m("3d20h", "Okay, thank you."),
      s(
        "meera",
        "1d1h",
        "Our supervisor visited today — Revathi is now doing the 20-minute walk at 5 PM. How has it been from your side?",
      ),
    ],
  },
  {
    member: "sneha",
    category: "schedule_change",
    priority: "medium",
    status: "in_progress",
    assignee: "rohit",
    createdAgo: "1d",
    staffRead: true,
    subject: "Shift caregiver start date to Friday",
    description:
      "Father's discharge from hospital has moved to Friday. Please shift the caregiver's start date from Wednesday to Friday.",
    messages: [
      sys("anjali", "23h30m", "Assigned to Rohit"),
      sys("rohit", "23h", "Rohit changed status to In progress"),
      s(
        "rohit",
        "22h",
        "Noted, Sneha. Shifting the start to Friday 10 AM. Would you like the caregiver to accompany him home from the hospital?",
      ),
      m("21h", "Yes please, that would really help."),
      m("20h30m", "Also please make sure she knows his blood thinner timings."),
    ],
  },
  {
    member: "vikram",
    category: "care_quality",
    priority: "high",
    status: "in_progress",
    assignee: "anjali",
    createdAgo: "2d6h",
    subject: "Fall not reported for three hours",
    description:
      "Grandmother had a fall in the bathroom yesterday. The caregiver didn't inform us for three hours.",
    messages: [
      sys("anjali", "2d5h", "Assigned to Anjali"),
      sys("anjali", "2d5h", "Anjali changed status to In progress"),
      s(
        "anjali",
        "2d4h50m",
        "I'm very sorry, Vikram. Is your grandmother okay? Our nurse supervisor will visit today and I'm reviewing the incident with the caregiver.",
      ),
      m("2d4h", "She has a bruise on her hip. The doctor says there's no fracture."),
      s(
        "anjali",
        "2d2h",
        "Relieved to hear that. We'll install bathroom grab bars at no cost, and the caregiver has been retrained: falls must be reported within 15 minutes.",
      ),
      m("1d", "Thank you. When will the grab bars be installed?"),
      s("anjali", "23h", "Installation is booked for today at 11 AM."),
      m("42m", "The installer hasn't come. Can you check?"),
    ],
  },
  {
    member: "ananya",
    category: "app_issue",
    priority: "low",
    status: "in_progress",
    assignee: "rohit",
    createdAgo: "6h",
    memberRead: true,
    subject: "App crashes when uploading vaccination card",
    description: "The app crashes every time I try to upload the twins' vaccination card.",
    messages: [
      sys("rohit", "5h50m", "Assigned to Rohit"),
      sys("rohit", "5h50m", "Rohit changed status to In progress"),
      s("rohit", "5h45m", "Hi Ananya, could you tell me your phone model and app version?"),
      m("5h", "Redmi Note 12, version 3.4.1."),
      s(
        "rohit",
        "4h",
        "Thanks — our app team has reproduced it on 3.4.1 and a fix ships in 3.4.2 this week. Meanwhile, share the card here and I'll attach it for you.",
      ),
    ],
  },
  {
    member: "rahul",
    category: "late_nurse",
    priority: "medium",
    status: "in_progress",
    assignee: "meera",
    createdAgo: "1d8h",
    subject: "Physiotherapist missed today's session",
    description: "The physiotherapist missed today's session for my father without informing us.",
    messages: [
      sys("anjali", "1d7h30m", "Assigned to Meera"),
      sys("meera", "1d7h20m", "Meera changed status to In progress"),
      s(
        "meera",
        "1d7h",
        "Apologies, Rahul — Dr. Nikhil had a family emergency. I've rescheduled the session for tomorrow at 6 PM.",
      ),
      m("1d6h", "Okay, thanks."),
      m("6m", "He hasn't come today either and isn't answering calls."),
    ],
  },

  // ----- Resolved -----
  {
    member: "arjun",
    category: "app_issue",
    priority: "low",
    status: "resolved",
    assignee: "rohit",
    createdAgo: "6d",
    memberRead: true,
    rating: { score: 5, comment: "Quick fix, thanks Rohit." },
    subject: "Can't add my sister as a family member",
    description:
      "I'm unable to add my sister as a family member on the app. The invite button does nothing.",
    messages: [
      sys("rohit", "5d23h30m", "Assigned to Rohit"),
      s(
        "rohit",
        "5d23h",
        "Hi Arjun — family invites need the latest app version (3.4). Could you update and try Profile → Family → Invite?",
      ),
      m("5d21h", "Updated and it worked. Thanks!"),
      s("rohit", "5d20h50m", "Great to hear! Closing this ticket."),
      sys("rohit", "5d20h45m", "Rohit changed status to Resolved"),
    ],
  },
  {
    member: "kavya",
    category: "billing",
    priority: "medium",
    status: "resolved",
    assignee: "meera",
    createdAgo: "5d6h",
    memberRead: true,
    rating: { score: 4, comment: "Clear answer, but it took two days." },
    subject: "Breakdown of extra night charges",
    description: "Please share a breakdown of the extra night charges on the October invoice.",
    messages: [
      sys("anjali", "5d5h", "Assigned to Meera"),
      s(
        "meera",
        "3d8h",
        "Hi Kavya, night shifts after 10 PM are billed at 1.25x. You had four extra nights in October (12, 13, 19 and 20 Oct).",
      ),
      m("3d6h", "Understood, thanks for clarifying."),
      sys("meera", "3d5h", "Meera changed status to Resolved"),
    ],
  },
  {
    member: "lakshmi",
    category: "late_nurse",
    priority: "high",
    status: "resolved",
    assignee: "rohit",
    createdAgo: "4d5h",
    memberRead: true,
    rating: { score: 3, comment: "Caregiver came eventually, but father missed breakfast." },
    subject: "Caregiver Mary not here yet",
    description:
      "Caregiver Mary is not here yet and it's 8:45. Father needs breakfast before his BP tablet.",
    messages: [
      s("rohit", "4d4h55m", "Calling Mary right now, Lakshmi."),
      s(
        "rohit",
        "4d4h45m",
        "Mary's bus broke down; she'll be there in 20 minutes. Sorry for the delay — please give him a light snack with the tablet.",
      ),
      m("4d4h20m", "She's here now."),
      sys("rohit", "4d4h", "Rohit changed status to Resolved"),
    ],
  },
  {
    member: "sneha",
    category: "other",
    priority: "medium",
    status: "resolved",
    assignee: "anjali",
    createdAgo: "3d10h",
    memberRead: true,
    rating: { score: 5, comment: "Very helpful and kind." },
    subject: "Caregiver to accompany father to OPD",
    description:
      "Can the caregiver accompany father to his OPD follow-up at the hospital on Monday?",
    messages: [
      s(
        "anjali",
        "3d9h",
        "Yes — Sunita can accompany him. There's no extra charge for hospital visits within 10 km.",
      ),
      m("3d8h", "Wonderful, thank you."),
      sys("anjali", "3d7h", "Anjali changed status to Resolved"),
    ],
  },
  {
    member: "vikram",
    category: "schedule_change",
    priority: "low",
    status: "resolved",
    assignee: "meera",
    createdAgo: "2d20h",
    subject: "Pause care for 25–27 Nov",
    description: "Please pause care from 25 to 27 Nov — we're taking grandmother to Haridwar.",
    messages: [
      s(
        "meera",
        "2d18h",
        "Done — care is paused 25–27 Nov and you won't be billed for those days. Have a safe trip!",
      ),
      sys("meera", "2d18h", "Meera changed status to Resolved"),
    ],
  },
  {
    member: "ananya",
    category: "care_quality",
    priority: "medium",
    status: "resolved",
    assignee: "rohit",
    createdAgo: "1d18h",
    memberRead: true,
    subject: "Nanny on her phone while feeding the twins",
    description:
      "The nanny uses her phone a lot while feeding the twins. I'm worried she isn't paying attention.",
    messages: [
      s(
        "rohit",
        "1d16h",
        "Thanks for telling us, Ananya. I've spoken to Lata — she's agreed to keep her phone away while feeding and during care hours.",
      ),
      m("1d15h", "Thank you, I'll keep an eye on it."),
      s("rohit", "1d14h", "Please let us know if it happens again. I'm closing this for now."),
      sys("rohit", "1d14h", "Rohit changed status to Resolved"),
    ],
  },
];

export const QUICK_REPLIES = [
  {
    title: "Nurse running late",
    category: "late_nurse",
    body: "Hi {{memberName}}, I'm sorry for the delay. I've just spoken to the caregiver — they're on the way and should reach in about [X] minutes. I'll update you on {{ticketNo}} as soon as they check in.\n\n— {{agentName}}, CarePal team",
  },
  {
    title: "Replacement caregiver assigned",
    category: "any",
    body: "Hi {{memberName}}, we've arranged a replacement caregiver, [name], who will reach by [time]. They've been briefed on the care plan. I'll keep {{ticketNo}} open until the visit is complete.\n\n— {{agentName}}",
  },
  {
    title: "Invoice under review",
    category: "billing",
    body: "Hi {{memberName}}, thanks for flagging this. I've shared the invoice with our billing team for review — you'll hear back within 2 working days. Any auto-debit for this invoice is on hold until then.\n\n— {{agentName}}",
  },
  {
    title: "Schedule change confirmed",
    category: "schedule_change",
    body: "Hi {{memberName}}, your schedule change is confirmed: [details]. The caregiver has been informed. Reply on {{ticketNo}} if anything else needs to change.\n\n— {{agentName}}",
  },
  {
    title: "Need more details",
    category: "any",
    body: "Hi {{memberName}}, so we can help quickly, could you share a few more details — the date and time, the caregiver's name, and anything else you noticed?\n\n— {{agentName}}",
  },
  {
    title: "Closing the ticket",
    category: "any",
    body: "Hi {{memberName}}, glad we could sort this out. I'm marking {{ticketNo}} as resolved — you can rate your experience on the ticket. If anything else comes up, just raise a new ticket.\n\n— {{agentName}}, CarePal team",
  },
];
