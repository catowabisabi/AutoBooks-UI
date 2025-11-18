import type {
  Email,
  EmailAccount,
  EmailSender,
  EmailAttachment
} from '@/types/email';

// Mock email accounts
export const mockAccounts: EmailAccount[] = [
  {
    id: 'work',
    name: 'Work',
    email: 'user@company.com',
    color: '#0ea5e9'
  },
  {
    id: 'personal',
    name: 'Personal',
    email: 'user@example.com',
    color: '#8b5cf6'
  }
];

// Mock email senders
const mockSenders: Record<string, EmailSender> = {
  alice: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: '/avatars/alice.jpg',
    organization: {
      name: 'Acme Inc',
      logo: '/logos/acme.svg',
      website: 'https://acme.example.com'
    }
  },
  bob: {
    name: 'Bob Smith',
    email: 'bob@company.com',
    avatar: '/avatars/bob.jpg',
    organization: {
      name: 'Company LLC',
      logo: '/logos/company.svg',
      website: 'https://company.example.com'
    }
  },
  carol: {
    name: 'Carol Williams',
    email: 'carol@personal.com',
    avatar: '/avatars/carol.jpg'
  },
  dave: {
    name: 'Dave Brown',
    email: 'dave@tech.com',
    avatar: '/avatars/dave.jpg',
    organization: {
      name: 'Tech Solutions',
      logo: '/logos/tech.svg'
    }
  }
};

// Mock attachments
const mockAttachments: Record<string, EmailAttachment[]> = {
  report: [
    {
      name: 'Q2-Report.pdf',
      size: '2.4 MB',
      type: 'application/pdf',
      url: '/attachments/report.pdf'
    }
  ],
  images: [
    {
      name: 'product-image.jpg',
      size: '1.2 MB',
      type: 'image/jpeg',
      url: '/attachments/product.jpg'
    },
    {
      name: 'diagram.png',
      size: '845 KB',
      type: 'image/png',
      url: '/attachments/diagram.png'
    }
  ],
  document: [
    {
      name: 'Contract.docx',
      size: '567 KB',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '/attachments/contract.docx'
    }
  ]
};

// Mock emails
export const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Project Update - Q2 Goals',
    sender: mockSenders.alice,
    recipients: [{ name: 'Me', email: 'user@company.com' }],
    content: `
Hi team,

I wanted to share a quick update on our Q2 goals. We're making good progress on most fronts, but there are a few areas where we need to focus more attention.

Please review the attached report and let me know if you have any questions or concerns.

Best,
Alice
    `,
    date: '2023-06-15T10:30:00Z',
    read: false,
    flagged: true,
    snoozed: false,
    archived: false,
    deleted: false,
    attachments: mockAttachments.report,
    account: 'work',
    categories: ['work', 'updates']
  },
  {
    id: '2',
    subject: 'Meeting Notes - Product Review',
    sender: mockSenders.bob,
    recipients: [{ name: 'Me', email: 'user@company.com' }, mockSenders.alice],
    content: `
Hello,

Attached are the notes from our product review meeting yesterday. We covered a lot of ground and made some important decisions about the roadmap.

Let's follow up next week to discuss implementation details.

Regards,
Bob
    `,
    date: '2023-06-14T15:45:00Z',
    read: true,
    flagged: false,
    snoozed: false,
    archived: false,
    deleted: false,
    attachments: mockAttachments.document,
    account: 'work',
    categories: ['work']
  },
  {
    id: '3',
    subject: 'Weekend Plans',
    sender: mockSenders.carol,
    recipients: [{ name: 'Me', email: 'user@example.com' }],
    content: `
Hey!

Are you free this weekend? A few of us are planning to go hiking at the national park. Would be great if you could join!

Let me know,
Carol
    `,
    date: '2023-06-13T20:15:00Z',
    read: true,
    flagged: false,
    snoozed: false,
    archived: false,
    deleted: false,
    account: 'personal',
    categories: ['personal', 'social']
  },
  {
    id: '4',
    subject: 'New Product Designs',
    sender: mockSenders.dave,
    recipients: [
      { name: 'Me', email: 'user@company.com' },
      mockSenders.alice,
      mockSenders.bob
    ],
    content: `
Team,

I've finished the initial designs for the new product line. Please take a look at the attached images and provide feedback.

I think the new approach addresses many of the concerns raised in our last meeting.

Thanks,
Dave
    `,
    date: '2023-06-12T09:20:00Z',
    read: true,
    flagged: true,
    snoozed: false,
    archived: false,
    deleted: false,
    attachments: mockAttachments.images,
    account: 'work',
    categories: ['work', 'updates']
  },
  {
    id: '5',
    subject: 'Monthly Newsletter',
    sender: {
      name: 'Tech News',
      email: 'newsletter@tech-news.example.com',
      organization: {
        name: 'Tech News',
        logo: '/logos/tech-news.svg'
      }
    },
    recipients: [{ name: 'Me', email: 'user@example.com' }],
    content: `
# Tech News Monthly

## Top Stories
- AI Breakthrough: New Model Achieves Human-Level Performance
- Tech Giants Announce Collaboration on Climate Initiative
- The Future of Remote Work: New Tools and Practices

Read more on our website!
    `,
    date: '2023-06-10T08:00:00Z',
    read: false,
    flagged: false,
    snoozed: true,
    snoozeUntil: new Date('2023-06-17T08:00:00Z'),
    archived: false,
    deleted: false,
    account: 'personal',
    categories: ['updates', 'promotions']
  }
];
