import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
    },
    title: {
        fontSize: 14,
        color: '#6366f1',
        marginTop: 4,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#1F2937',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    bodyText: {
        fontSize: 10,
        color: '#4B5563',
        lineHeight: 1.6,
    },
    experienceItem: {
        marginBottom: 15,
    },
    expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    expTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#111827',
    },
    expCompany: {
        fontSize: 11,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 3,
        paddingLeft: 10,
    },
    bulletText: {
        fontSize: 10,
        color: '#4B5563',
        lineHeight: 1.5,
        flex: 1,
    },
    bulletDot: {
        width: 3,
        height: 3,
        backgroundColor: '#6B7280',
        borderRadius: 2,
        marginTop: 5,
        marginRight: 6,
    },
    skillsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    skillBadge: {
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 600,
        marginRight: 5,
        marginBottom: 5,
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

            {/* Header Info */}
            <View style={styles.header}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.title}>{targetRole}</Text>
            </View>

            {/* Summary Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.summary}</Text>
                <Text style={styles.bodyText}>{data.summary.suggested}</Text>
            </View>

            {/* Experience Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.experience}</Text>
                {data.experiences.map((exp) => (
                    <View key={exp.id} style={styles.experienceItem}>
                        <View style={styles.expHeader}>
                            <Text style={styles.expTitle}>{exp.title}</Text>
                        </View>
                        <Text style={styles.expCompany}>{exp.company}</Text>

                        <View style={{ marginTop: 6 }}>
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

            {/* Skills Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.skills}</Text>
                <View style={styles.skillsSection}>
                    {data.skills.suggested.map((skill, idx) => (
                        <Text key={idx} style={styles.skillBadge}>{skill}</Text>
                    ))}
                </View>
            </View>

        </Page>
    </Document>
);
