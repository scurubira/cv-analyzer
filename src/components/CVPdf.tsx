import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        paddingLeft: '32%', // Reserve space for the left sidebar
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '32%',
        backgroundColor: '#1E293B',
        color: '#FFFFFF',
        padding: 30,
        flexDirection: 'column',
    },
    mainBody: {
        width: '100%',
        padding: 40,
        backgroundColor: '#F8FAFC',
    },
    name: {
        fontSize: 26,
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1,
    },
    title: {
        fontSize: 14,
        color: '#38BDF8',
        fontWeight: 600,
        marginBottom: 30,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 25,
    },
    sidebarSectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: '#94A3B8',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        paddingBottom: 5,
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
        color: '#38BDF8',
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
        fontSize: 10,
        color: '#E2E8F0',
        marginBottom: 6,
        lineHeight: 1.4,
    }
});

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
}

export const CVPdfDocument: React.FC<CVPdfProps> = ({ data, name, targetRole, labels }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.title}>{targetRole}</Text>

                <View style={styles.section}>
                    <Text style={styles.sidebarSectionTitle}>{labels.skills}</Text>
                    <View style={styles.skillsContainer}>
                        {data.skills.suggested.map((skill, idx) => (
                            <Text key={idx} style={styles.skillItem}>• {skill}</Text>
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
                            <Text style={styles.expCompany}>{exp.company}</Text>

                            <View style={{ marginTop: 4 }}>
                                {exp.suggestedBullets.map((bullet, idx) => (
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
