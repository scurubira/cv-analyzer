import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

export type CVThemeColor = 'slate' | 'emerald' | 'violet' | 'rose' | 'amber';

const THEMES: Record<CVThemeColor, { bg: string; accent: string; accentLight: string; text: string; sidebarBg: string; sidebarText: string; sidebarBorder: string }> = {
    slate: { bg: '#1E293B', accent: '#38BDF8', accentLight: '#E0F2FE', text: '#FFFFFF', sidebarBg: '#F1F5F9', sidebarText: '#1E293B', sidebarBorder: '#CBD5E1' },
    emerald: { bg: '#064E3B', accent: '#34D399', accentLight: '#D1FAE5', text: '#FFFFFF', sidebarBg: '#F0FDF4', sidebarText: '#064E3B', sidebarBorder: '#A7F3D0' },
    violet: { bg: '#4C1D95', accent: '#A78BFA', accentLight: '#EDE9FE', text: '#FFFFFF', sidebarBg: '#F5F3FF', sidebarText: '#4C1D95', sidebarBorder: '#C4B5FD' },
    rose: { bg: '#881337', accent: '#FB7185', accentLight: '#FFE4E6', text: '#FFFFFF', sidebarBg: '#FFF1F2', sidebarText: '#881337', sidebarBorder: '#FECDD3' },
    amber: { bg: '#78350F', accent: '#FBBF24', accentLight: '#FEF3C7', text: '#FFFFFF', sidebarBg: '#FFFBEB', sidebarText: '#78350F', sidebarBorder: '#FDE68A' },
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    // ─── HEADER ───────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 24,
        paddingBottom: 22,
        paddingHorizontal: 28,
    },
    headerLeft: {
        flexDirection: 'column',
        flex: 1,
    },
    headerName: {
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 1,
        opacity: 0.85,
        textTransform: 'uppercase',
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 3,
    },
    headerContact: {
        fontSize: 9,
        opacity: 0.9,
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    // ─── BODY (two columns) ───────────────────────────────────
    body: {
        flexDirection: 'row',
        flex: 1,
    },
    // ─── MAIN (left 65%) ──────────────────────────────────────
    main: {
        width: '65%',
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 24,
        paddingRight: 16,
        backgroundColor: '#FFFFFF',
    },
    mainSection: {
        marginBottom: 14,
    },
    mainSectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1.5,
    },
    bodyText: {
        fontSize: 9.5,
        color: '#374151',
        lineHeight: 1.5,
    },
    expItem: {
        marginBottom: 12,
    },
    expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 1,
    },
    expTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#111827',
        flex: 1,
    },
    expPeriod: {
        fontSize: 8.5,
        color: '#6B7280',
        fontStyle: 'italic',
        marginLeft: 8,
    },
    expCompany: {
        fontSize: 9.5,
        fontWeight: 600,
        marginBottom: 5,
    },
    bulletRow: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 2,
    },
    bulletDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        marginTop: 4.5,
        marginRight: 7,
        flexShrink: 0,
    },
    bulletText: {
        fontSize: 9,
        color: '#4B5563',
        lineHeight: 1.4,
        flex: 1,
    },
    eduItem: {
        marginBottom: 8,
    },
    eduDegree: {
        fontSize: 10,
        fontWeight: 700,
        color: '#111827',
    },
    eduInstitution: {
        fontSize: 9,
        color: '#6B7280',
        marginTop: 1,
    },
    // ─── SIDEBAR (right 35%) ──────────────────────────────────
    sidebar: {
        width: '35%',
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 14,
        paddingRight: 18,
        borderLeftWidth: 1,
    },
    sideSection: {
        marginBottom: 14,
    },
    sideSectionTitle: {
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 7,
        paddingBottom: 3,
        borderBottomWidth: 1,
    },
    skillBadge: {
        fontSize: 8.5,
        marginBottom: 4,
        lineHeight: 1.3,
    },
    tagPill: {
        fontSize: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        marginBottom: 4,
        marginRight: 4,
        alignSelf: 'flex-start',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    refItem: {
        marginBottom: 7,
    },
    refName: {
        fontSize: 9,
        fontWeight: 700,
        color: '#111827',
    },
    refDetail: {
        fontSize: 8,
        color: '#6B7280',
        lineHeight: 1.3,
    },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    langName: {
        fontSize: 9,
        fontWeight: 600,
    },
    langLevel: {
        fontSize: 7.5,
        opacity: 0.7,
        marginBottom: 2,
        textAlign: 'right',
    },
    langDots: {
        flexDirection: 'row',
        gap: 3,
        marginTop: 1,
    },
    langDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});

interface CVPdfProps {
    data: {
        summary: { suggested: string };
        contact?: { email?: string; phone?: string; location?: string; linkedin?: string };
        experiences: { id: number; company: string; title: string; period?: string; suggestedBullets: string[] }[];
        education?: { degree: string; institution: string; year: string }[];
        certifications?: string[];
        languages?: { language: string; level: string }[];
        targetTitles?: string[];
        selectedTitle?: string;
        socialNetworks?: { github?: string; portfolio?: string; twitter?: string; instagram?: string };
        references?: { name: string; title?: string; company?: string; contact?: string }[];
        skills: { suggested: string[] };
    };
    name: string;
    targetRole: string;
    labels: {
        summary: string;
        experience: string;
        skills: string;
        education: string;
        languages: string;
        certifications: string;
        references: string;
    };
    colorTheme?: CVThemeColor;
}

export const CVPdfDocument: React.FC<CVPdfProps> = ({ data, name, targetRole, labels, colorTheme = 'slate' }) => {
    const t = THEMES[colorTheme as CVThemeColor] || THEMES.slate;

    // Map language level to 1-5 dots
    const levelToDots = (level: string): number => {
        const l = (level || '').toLowerCase();
        if (l.includes('native') || l.includes('fluente') || l.includes('nativo')) return 5;
        if (l.includes('fluent') || l.includes('avançad') || l.includes('advanced')) return 4;
        if (l.includes('upper') || l.includes('inter')) return 3;
        if (l.includes('basic') || l.includes('básic') || l.includes('elementar')) return 2;
        if (l.includes('beginn') || l.includes('inician')) return 1;
        return 3; // default
    };

    const displayTitle = data.selectedTitle || (data.targetTitles?.[0]) || targetRole;

    // Contacts list for header
    const contacts: string[] = [];
    if (data.contact?.email) contacts.push(data.contact.email);
    if (data.contact?.phone) contacts.push(data.contact.phone);
    if (data.contact?.location) contacts.push(data.contact.location);
    if (data.contact?.linkedin) contacts.push(data.contact.linkedin);
    if (data.socialNetworks?.github) contacts.push(`GitHub: ${data.socialNetworks.github}`);
    if (data.socialNetworks?.portfolio) contacts.push(data.socialNetworks.portfolio);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ── HEADER ── */}
                <View style={[styles.header, { backgroundColor: t.bg }]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerName, { color: t.text }]}>{name}</Text>
                        {displayTitle ? (
                            <Text style={[styles.headerTitle, { color: t.accent }]}>{displayTitle}</Text>
                        ) : null}
                    </View>
                    <View style={styles.headerRight}>
                        {contacts.map((c, i) => (
                            <Text key={i} style={[styles.headerContact, { color: t.text }]}>{c}</Text>
                        ))}
                        {data.socialNetworks?.twitter && <Text style={[styles.headerContact, { color: t.text }]}>Twitter: {data.socialNetworks.twitter}</Text>}
                        {data.socialNetworks?.instagram && <Text style={[styles.headerContact, { color: t.text }]}>Instagram: {data.socialNetworks.instagram}</Text>}
                    </View>
                </View>

                {/* ── BODY ── */}
                <View style={styles.body}>

                    {/* ── MAIN COLUMN ── */}
                    <View style={styles.main}>

                        {/* Summary */}
                        {data.summary.suggested ? (
                            <View style={styles.mainSection}>
                                <Text style={[styles.mainSectionTitle, { color: t.bg, borderBottomColor: t.accentLight }]}>
                                    {labels.summary}
                                </Text>
                                <Text style={styles.bodyText}>{data.summary.suggested}</Text>
                            </View>
                        ) : null}

                        {/* Experience */}
                        {data.experiences?.length > 0 && (
                            <View style={styles.mainSection}>
                                <Text style={[styles.mainSectionTitle, { color: t.bg, borderBottomColor: t.accentLight }]}>
                                    {labels.experience}
                                </Text>
                                {data.experiences.map((exp) => (
                                    <View key={exp.id} style={styles.expItem}>
                                        <View style={styles.expHeader}>
                                            <Text style={styles.expTitle}>{exp.title}</Text>
                                            {exp.period && <Text style={styles.expPeriod}>{exp.period}</Text>}
                                        </View>
                                        <Text style={[styles.expCompany, { color: t.bg }]}>{exp.company}</Text>
                                        {exp.suggestedBullets?.map((bullet, idx) => (
                                            <View key={idx} style={styles.bulletRow}>
                                                <View style={[styles.bulletDot, { backgroundColor: t.accent }]} />
                                                <Text style={styles.bulletText}>{bullet}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Education */}
                        {data.education && data.education.length > 0 && (
                            <View style={styles.mainSection}>
                                <Text style={[styles.mainSectionTitle, { color: t.bg, borderBottomColor: t.accentLight }]}>
                                    {labels.education}
                                </Text>
                                {data.education.map((edu, idx) => (
                                    <View key={idx} style={styles.eduItem}>
                                        <Text style={styles.eduDegree}>{edu.degree}</Text>
                                        <Text style={styles.eduInstitution}>{edu.institution}{edu.year ? `  ·  ${edu.year}` : ''}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                    </View>

                    {/* ── SIDEBAR COLUMN ── */}
                    <View style={[styles.sidebar, { backgroundColor: t.sidebarBg, borderLeftColor: t.sidebarBorder }]}>

                        {/* Skills */}
                        {data.skills?.suggested?.length > 0 && (
                            <View style={styles.sideSection}>
                                <Text style={[styles.sideSectionTitle, { color: t.sidebarText, borderBottomColor: t.sidebarBorder }]}>
                                    {labels.skills}
                                </Text>
                                <View style={styles.tagsRow}>
                                    {data.skills.suggested.map((skill, i) => (
                                        <View key={i} style={[styles.tagPill, { backgroundColor: t.accentLight }]}>
                                            <Text style={[styles.skillBadge, { color: t.sidebarText }]}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && (
                            <View style={styles.sideSection}>
                                <Text style={[styles.sideSectionTitle, { color: t.sidebarText, borderBottomColor: t.sidebarBorder }]}>
                                    {labels.languages}
                                </Text>
                                {data.languages.map((lang, i) => {
                                    const lvl = typeof lang === 'string' ? lang : lang.level || '';
                                    const name = typeof lang === 'string' ? lang : lang.language;
                                    const dots = levelToDots(lvl);
                                    return (
                                        <View key={i} style={{ marginBottom: 6 }}>
                                            <View style={styles.langRow}>
                                                <Text style={[styles.langName, { color: t.sidebarText }]}>{name}</Text>
                                                <Text style={[styles.langLevel, { color: t.sidebarText }]}>{lvl}</Text>
                                            </View>
                                            <View style={styles.langDots}>
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <View key={n} style={[styles.langDot, { backgroundColor: n <= dots ? t.accent : t.sidebarBorder }]} />
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Certifications */}
                        {data.certifications && data.certifications.length > 0 && (
                            <View style={styles.sideSection}>
                                <Text style={[styles.sideSectionTitle, { color: t.sidebarText, borderBottomColor: t.sidebarBorder }]}>
                                    {labels.certifications}
                                </Text>
                                {data.certifications.map((cert, i) => (
                                    <Text key={i} style={[styles.skillBadge, { color: t.sidebarText }]}>· {cert}</Text>
                                ))}
                            </View>
                        )}

                        {/* References */}
                        {data.references && data.references.length > 0 && (
                            <View style={styles.sideSection}>
                                <Text style={[styles.sideSectionTitle, { color: t.sidebarText, borderBottomColor: t.sidebarBorder }]}>
                                    {labels.references}
                                </Text>
                                {data.references.map((ref, i) => (
                                    <View key={i} style={styles.refItem}>
                                        <Text style={styles.refName}>{ref.name}</Text>
                                        {ref.title && <Text style={styles.refDetail}>{ref.title}</Text>}
                                        {ref.company && <Text style={styles.refDetail}>{ref.company}</Text>}
                                        {ref.contact && <Text style={styles.refDetail}>{ref.contact}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default CVPdfDocument;
