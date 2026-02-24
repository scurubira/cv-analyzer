import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        paddingLeft: '42%', // Reserve space for the left sidebar
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '42%',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 10,
        flexDirection: 'column',
        textAlign: 'left',
    },
    mainBody: {
        width: '100%',
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 20,
        paddingLeft: 8,
        backgroundColor: '#F8FAFC',
    },
    name: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    targetTitles: {
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 15,
        opacity: 0.9,
    },
    title: {
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 24,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 15,
    },
    sidebarSectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        paddingBottom: 4,
    },
    mainSectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#0F172A',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 2,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 5,
    },
    bodyText: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 1.4,
    },
    experienceItem: {
        marginBottom: 12,
    },
    expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    expTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#0F172A',
    },
    expCompany: {
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 6,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 5,
    },
    bulletText: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.3,
        flex: 1,
    },
    bulletDot: {
        width: 3,
        height: 3,
        backgroundColor: '#94A3B8',
        borderRadius: 2,
        marginTop: 5,
        marginRight: 8,
    },
    skillsContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    skillItem: {
        fontSize: 9,
        marginBottom: 5,
        lineHeight: 1.2,
    },
    contactSection: {
        marginBottom: 25,
        borderBottomWidth: 1,
        paddingBottom: 15,
    },
    contactItemText: {
        fontSize: 9,
        marginBottom: 6,
        lineHeight: 1.1,
    }
});

export type CVThemeColor = 'slate' | 'emerald' | 'violet' | 'rose' | 'amber';

const THEMES: Record<CVThemeColor, any> = {
    slate: { bg: '#1E293B', text: '#F8FAFC', accent: '#38BDF8', sectionBorder: '#334155', name: '#FFFFFF', sectionText: '#94A3B8' },
    emerald: { bg: '#064E3B', text: '#ECFDF5', accent: '#34D399', sectionBorder: '#065F46', name: '#FFFFFF', sectionText: '#A7F3D0' },
    violet: { bg: '#4C1D95', text: '#F5F3FF', accent: '#A78BFA', sectionBorder: '#5B21B6', name: '#FFFFFF', sectionText: '#C4B5FD' },
    rose: { bg: '#881337', text: '#FFF1F2', accent: '#FB7185', sectionBorder: '#9F1239', name: '#FFFFFF', sectionText: '#FECDD3' },
    amber: { bg: '#78350F', text: '#FFFBEB', accent: '#FBBF24', sectionBorder: '#92400E', name: '#FFFFFF', sectionText: '#FDE68A' },
};

interface CVPdfProps {
    data: {
        summary: { suggested: string };
        contact?: {
            email?: string;
            phone?: string;
            location?: string;
            linkedin?: string;
        };
        experiences: {
            id: number;
            company: string;
            title: string;
            suggestedBullets: string[];
        }[];
        education?: {
            degree: string;
            institution: string;
            year: string;
        }[];
        certifications?: string[];
        languages?: string[];
        targetTitles?: string[];
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
    };
    colorTheme?: CVThemeColor;
}

export const CVPdfDocument: React.FC<CVPdfProps> = ({ data, name, targetRole, labels, colorTheme = 'slate' }) => {
    const tConfig = THEMES[colorTheme as CVThemeColor] || THEMES.slate;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Sidebar */}
                <View style={[styles.sidebar, { backgroundColor: tConfig.bg, color: tConfig.text }]}>
                    <Text style={[styles.name, { color: tConfig.name }]}>{name}</Text>
                    {data.targetTitles && data.targetTitles.length > 0 && (
                        <Text style={[styles.targetTitles, { color: tConfig.name }]}>
                            {data.targetTitles.join(' | ')}
                        </Text>
                    )}

                    {data.contact && (
                        <View style={[styles.contactSection, { borderBottomColor: tConfig.sectionBorder }]}>
                            {data.contact.location && <Text style={styles.contactItemText}>{data.contact.location}</Text>}
                            {data.contact.phone && <Text style={styles.contactItemText}>{data.contact.phone}</Text>}
                            {data.contact.email && <Text style={styles.contactItemText}>{data.contact.email}</Text>}
                            {data.contact.linkedin && <Text style={styles.contactItemText}>{data.contact.linkedin}</Text>}
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={[styles.sidebarSectionTitle, { color: tConfig.sectionText, borderBottomColor: tConfig.sectionBorder }]}>{labels.skills}</Text>
                        <View style={styles.skillsContainer}>
                            {data.skills.suggested.map((skill: React.ReactNode, idx: React.Key | null | undefined) => (
                                <Text key={idx} style={[styles.skillItem, { color: tConfig.text }]}>• {skill}</Text>
                            ))}
                        </View>
                    </View>

                    {data.languages && data.languages.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sidebarSectionTitle, { color: tConfig.sectionText, borderBottomColor: tConfig.sectionBorder }]}>{labels.languages}</Text>
                            <View style={styles.skillsContainer}>
                                {data.languages.map((lang: React.ReactNode, idx: React.Key | null | undefined) => (
                                    <Text key={idx} style={[styles.skillItem, { color: tConfig.text }]}>• {lang}</Text>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Main Content */}
                <View style={styles.mainBody}>

                    {/* Summary Section */}
                    <View style={styles.section}>
                        <Text style={styles.mainSectionTitle}>{labels.summary}</Text>
                        <Text style={styles.bodyText}>{data.summary.suggested}</Text>
                    </View>

                    {/* Experience Section */}
                    <View style={styles.section}>
                        <Text style={styles.mainSectionTitle}>{labels.experience}</Text>
                        {data.experiences.map((exp) => (
                            <View key={exp.id} style={styles.experienceItem}>
                                <View style={styles.expHeader}>
                                    <Text style={styles.expTitle}>{exp.title}</Text>
                                </View>
                                <Text style={[styles.expCompany, { color: tConfig.accent }]}>{exp.company}</Text>

                                <View style={{ marginTop: 4 }}>
                                    {exp.suggestedBullets.map((bullet: React.ReactNode, idx: React.Key | null | undefined) => (
                                        <View key={idx} style={styles.bulletPoint}>
                                            <View style={styles.bulletDot} />
                                            <Text style={styles.bulletText}>{bullet}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Education Section */}
                    {data.education && data.education.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.mainSectionTitle}>{labels.education}</Text>
                            {data.education.map((edu, idx) => (
                                <View key={idx} style={styles.experienceItem}>
                                    <View style={styles.expHeader}>
                                        <Text style={styles.expTitle}>{edu.degree}</Text>
                                    </View>
                                    <Text style={[styles.expCompany, { color: tConfig.accent }]}>
                                        {edu.institution} {edu.year ? ` • ${edu.year}` : ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Certifications Section */}
                    {data.certifications && data.certifications.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.mainSectionTitle}>{labels.certifications}</Text>
                            <View style={{ marginTop: 4 }}>
                                {data.certifications.map((cert: React.ReactNode, idx: React.Key | null | undefined) => (
                                    <View key={idx} style={styles.bulletPoint}>
                                        <View style={styles.bulletDot} />
                                        <Text style={styles.bulletText}>{cert}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};
