import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        paddingLeft: '28%', // Reserve space for the left sidebar
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '28%',
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 24,
        paddingRight: 15,
        flexDirection: 'column',
    },
    mainBody: {
        width: '100%',
        paddingTop: 30,
        paddingBottom: 30,
        paddingRight: 30,
        paddingLeft: 18,
        backgroundColor: '#F8FAFC',
    },
    name: {
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 24,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 25,
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
        lineHeight: 1.6,
    },
    experienceItem: {
        marginBottom: 20,
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
        marginBottom: 4,
        paddingLeft: 5,
    },
    bulletText: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.5,
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
        lineHeight: 1.5,
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
        experiences: {
            id: number;
            company: string;
            title: string;
            suggestedBullets: string[];
        }[];
        skills: { suggested: string[] };
    };
    name: string;
    targetRole: string;
    labels: {
        summary: string;
        experience: string;
        skills: string;
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
                    <Text style={[styles.title, { color: tConfig.accent }]}>{targetRole}</Text>

                    <View style={styles.section}>
                        <Text style={[styles.sidebarSectionTitle, { color: tConfig.sectionText, borderBottomColor: tConfig.sectionBorder }]}>{labels.skills}</Text>
                        <View style={styles.skillsContainer}>
                            {data.skills.suggested.map((skill: React.ReactNode, idx: React.Key | null | undefined) => (
                                <Text key={idx} style={[styles.skillItem, { color: tConfig.text }]}>• {skill}</Text>
                            ))}
                        </View>
                    </View>
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
                </View>
            </Page>
        </Document>
    );
};
