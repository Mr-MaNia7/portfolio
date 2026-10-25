import { Fragment } from 'react';
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { PortfolioConfig } from '@/types/portfolio';

/**
 * The résumé, typeset from portfolio-config.json — the same source as the
 * site, so the PDF can never drift from it. Built-in PDF faces (Helvetica,
 * Times) keep it dependency-free; they use WinAnsi encoding, so the few glyphs
 * outside it are spelled out by `pdfText`.
 */
const INK = '#141413';
const SOFT = '#3d3b35';
const MUTED = '#6b6960';
const CLAY = '#a54a2a';
const RULE = '#e0d9cb';

const s = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 42,
    paddingHorizontal: 44,
    fontFamily: 'Helvetica',
    fontSize: 8.9,
    lineHeight: 1.36,
    color: INK,
  },
  name: { fontFamily: 'Times-Roman', fontSize: 25, lineHeight: 1.15, letterSpacing: -0.4 },
  title: { fontSize: 10.5, color: SOFT, marginTop: 4 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7, color: MUTED, fontSize: 8.6 },
  link: { color: MUTED, textDecoration: 'none' },
  sep: { color: RULE, marginHorizontal: 6 },
  stats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingVertical: 7,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: RULE,
  },
  stat: { flex: 1 },
  statValue: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  statLabel: { fontSize: 7.6, color: MUTED },
  section: { marginTop: 12 },
  label: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.4,
    letterSpacing: 1.1,
    color: CLAY,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  para: { color: SOFT, marginBottom: 4 },
  roleHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  roleTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  roleDate: { fontSize: 8.4, color: MUTED },
  roleCompany: { color: CLAY, marginTop: 1 },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingRight: 8 },
  dash: { width: 10, color: CLAY },
  bulletText: { flex: 1, color: SOFT },
  tech: { fontSize: 8, color: MUTED, marginTop: 3 },
  cap: { marginBottom: 3 },
  capName: { fontFamily: 'Helvetica-Bold', fontSize: 9.2 },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.4,
    color: MUTED,
  },
});

/** Roles printed with highlights and stack; older roles print the description only. */
const RECENT_ROLES = 4;

/** Achievements the header, stats and education lines already carry. */
const ALREADY_STATED = /^(Top Rated Plus|GPA|500\+ merged)/;

/** Glyphs outside WinAnsi, spelled for the built-in faces. */
const pdfText = (t: string) =>
  t.replace(/(\d(?:\.\d)?)★/g, '$1/5').replace(/★/g, '').replace(/≈/g, '~');

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bullet}>
      <Text style={s.dash}>–</Text>
      <Text style={s.bulletText}>{pdfText(children)}</Text>
    </View>
  );
}

export function ResumeDocument({
  config,
  siteUrl,
}: {
  config: PortfolioConfig;
  siteUrl: string;
}) {
  const { personal, stats, experience, skills, education, social, availability, resume } =
    config;
  const canonical = /localhost|127\.0\.0\.1/.test(siteUrl)
    ? 'https://abdulkarimg.com'
    : siteUrl;
  const host = new URL(canonical).host;
  const [intro, current] = personal.bio.split(/\n{2,}/);

  const contact = [
    { label: personal.email, href: `mailto:${personal.email}` },
    { label: host, href: canonical },
    { label: personal.location },
    social.upwork && { label: 'Upwork', href: social.upwork },
    social.github && { label: 'GitHub', href: social.github },
    social.linkedin && { label: 'LinkedIn', href: social.linkedin },
  ].filter(Boolean) as Array<{ label: string; href?: string }>;

  return (
    <Document
      title={resume.title}
      author={personal.name}
      subject={personal.title}
      creator={host}
      producer={host}
    >
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{personal.name}</Text>
        <Text style={s.title}>
          {personal.title} · {personal.upworkBadge}
        </Text>
        <View style={s.contact}>
          {contact.map((c, i) => (
            <View key={c.label} style={{ flexDirection: 'row' }}>
              {i > 0 && <Text style={s.sep}>·</Text>}
              {c.href ? (
                <Link src={c.href} style={s.link}>
                  {c.label}
                </Link>
              ) : (
                <Text>{c.label}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={s.stats}>
          {stats.map((st) => (
            <View key={st.label} style={s.stat}>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.label}>Profile</Text>
          <Text style={s.para}>{pdfText(intro)}</Text>
          {current && <Text style={s.para}>{pdfText(current)}</Text>}
          <Text style={s.para}>
            {availability.headline} · {availability.workMode}, {availability.location}.
          </Text>
        </View>

        {/* Roles sit directly on the page (not in a wrapper) so they paginate cleanly */}
        <Text style={[s.label, { marginTop: 12 }]}>Experience</Text>
          {experience.map((exp, i) => (
            // A fragment, not a View: react-pdf won't split a role box across
            // pages, which left a hole at the foot of page one.
            <Fragment key={exp.company + exp.position}>
              <View style={[s.roleHead, i > 0 ? { marginTop: 8 } : {}]} minPresenceAhead={36}>
                <Text style={s.roleTitle}>{exp.position}</Text>
                <Text style={s.roleDate}>{exp.duration}</Text>
              </View>
              <Text style={s.roleCompany}>
                {exp.company}
                <Text style={{ color: MUTED }}>
                  {' '}
                  · {exp.type}
                  {exp.location ? ` · ${exp.location}` : ''}
                </Text>
              </Text>
              <Text style={[s.para, { marginTop: 3, marginBottom: 1 }]}>
                {pdfText(exp.description)}
              </Text>
              {/* Recent roles in full; older ones stand on their description */}
              {i < RECENT_ROLES &&
                exp.highlights?.map((h) => <Bullet key={h}>{h}</Bullet>)}
              {i < RECENT_ROLES && (
                <Text style={s.tech}>{exp.technologies.join(' · ')}</Text>
              )}
            </Fragment>
          ))}

        <View style={s.section}>
          <Text style={s.label} minPresenceAhead={80}>
            What I build
          </Text>
          <Text style={[s.para, { marginBottom: 7 }]}>
            Languages: {skills.languages.map((l) => l.name).join(', ')}
          </Text>
          {/* One column: a flex-wrap grid can't break across pages */}
          {skills.capabilities.map((c) => (
            <Text key={c.id} style={s.cap}>
              <Text style={s.capName}>{c.name}</Text>
              <Text style={{ color: MUTED }}> — {c.tools.join(' · ')}</Text>
            </Text>
          ))}
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.label}>Education & research</Text>
          <Text style={s.para}>
            <Text style={s.capName}>
              {education.degree}
              {education.stream ? ` (${education.stream})` : ''}
            </Text>
            {' '}— {education.institution}
            {education.gpa ? ` · GPA ${education.gpa}` : ''}
          </Text>
          {education.research && (
            <Text style={s.para}>Research: {education.research.title}</Text>
          )}
          <Text style={s.para}>
            {education.achievements
              .filter((a) => !ALREADY_STATED.test(a))
              .join('  ·  ')}
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {personal.name} · {host}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Updated ${resume.lastUpdated} · ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export function renderResumePdf(config: PortfolioConfig, siteUrl: string) {
  return renderToBuffer(<ResumeDocument config={config} siteUrl={siteUrl} />);
}
