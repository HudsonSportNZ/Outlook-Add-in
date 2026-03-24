/* global Office */

import * as React from "react";
import { Button, Badge, Input, Text, makeStyles, tokens } from "@fluentui/react-components";
import { ArrowLeft24Regular, Checkmark24Regular } from "@fluentui/react-icons";
import { Template } from "../types/template";

interface TemplatePreviewProps {
  template: Template;
  onBack: () => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  subHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  backButton: {
    minWidth: 0,
    padding: "4px 6px",
  },
  subHeaderTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
  },
  templateName: {
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground1,
  },
  subjectRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  subjectLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  subjectValue: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightRegular,
  },
  bodyCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px",
    backgroundColor: tokens.colorNeutralBackground2,
    fontSize: tokens.fontSizeBase200,
    lineHeight: "1.5",
    overflow: "auto",
    maxHeight: "240px",
  },
  mergeFieldsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  mergeLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  mergeField: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  mergeFieldLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  mergeFieldInput: {
    width: "100%",
  },
  actionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "10px 12px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  insertButton: {
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    ":hover": {
      backgroundColor: "#16213e",
    },
  },
  successRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
});

function detectMergeFields(body: string): string[] {
  const matches = body.match(/\{\{([^}]+)\}\}/g) || [];
  return Array.from(new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim())));
}

function applyMergeFields(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, key) => values[key.trim()] || _match);
}

function formatFieldLabel(field: string): string {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onBack }) => {
  const styles = useStyles();
  const [inserted, setInserted] = React.useState(false);
  const [inserting, setInserting] = React.useState(false);
  const [insertError, setInsertError] = React.useState<string | null>(null);

  const mergeFields = React.useMemo(() => detectMergeFields(template.body), [template.body]);

  const [mergeValues, setMergeValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(mergeFields.map((f) => [f, ""]))
  );

  const setFieldValue = (field: string, value: string) => {
    setMergeValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleInsert = async () => {
    setInserting(true);
    setInsertError(null);
    try {
      const item = Office.context.mailbox.item;
      if (!item) throw new Error("No active compose item");

      const resolvedSubject = applyMergeFields(template.subject, mergeValues);
      const resolvedBody = applyMergeFields(template.body, mergeValues);

      // Only set subject on new messages — leave it alone for replies/forwards
      const currentSubject = await new Promise<string>((resolve, reject) => {
        item.subject.getAsync((result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error.message));
          } else {
            resolve(result.value ?? "");
          }
        });
      });

      if (!currentSubject.trim()) {
        await new Promise<void>((resolve, reject) => {
          item.subject.setAsync(resolvedSubject, (result) => {
            if (result.status === Office.AsyncResultStatus.Failed) {
              reject(new Error(result.error.message));
            } else {
              resolve();
            }
          });
        });
      }

      await new Promise<void>((resolve, reject) => {
        item.body.setAsync(resolvedBody, { coercionType: Office.CoercionType.Html }, (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error.message));
          } else {
            resolve();
          }
        });
      });

      setInserted(true);
      setTimeout(() => {
        setInserted(false);
        onBack();
      }, 2000);
    } catch (err) {
      setInsertError(err instanceof Error ? err.message : "Insert failed");
    } finally {
      setInserting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.subHeader}>
        <Button
          className={styles.backButton}
          appearance="subtle"
          icon={<ArrowLeft24Regular />}
          onClick={onBack}
          size="small"
        />
        <Text className={styles.subHeaderTitle}>{template.name}</Text>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.metaRow}>
          <Badge className={styles.categoryBadge} appearance="filled" size="small">
            {template.category}
          </Badge>
        </div>

        <Text className={styles.templateName}>{template.name}</Text>

        <div className={styles.subjectRow}>
          <Text className={styles.subjectLabel}>Subject</Text>
          <Text className={styles.subjectValue}>{template.subject}</Text>
        </div>

        <div>
          <Text className={styles.subjectLabel} style={{ display: "block", marginBottom: "6px" }}>
            Body Preview
          </Text>
          <div className={styles.bodyCard} dangerouslySetInnerHTML={{ __html: template.body }} />
        </div>

        {mergeFields.length > 0 && (
          <div className={styles.mergeFieldsSection}>
            <Text className={styles.mergeLabel}>Fill in merge fields</Text>
            {mergeFields.map((field) => (
              <div key={field} className={styles.mergeField}>
                <Text className={styles.mergeFieldLabel}>{formatFieldLabel(field)}</Text>
                <Input
                  className={styles.mergeFieldInput}
                  placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}…`}
                  value={mergeValues[field] ?? ""}
                  onChange={(_e, data) => setFieldValue(field, data.value)}
                  size="small"
                />
              </div>
            ))}
          </div>
        )}

        {insertError && (
          <Text style={{ color: tokens.colorPaletteRedForeground1, fontSize: tokens.fontSizeBase200 }}>
            {insertError}
          </Text>
        )}
      </div>

      <div className={styles.actionRow}>
        {inserted ? (
          <div className={styles.successRow}>
            <Checkmark24Regular />
            <span>Inserted!</span>
          </div>
        ) : (
          <>
            <Button
              appearance="primary"
              className={styles.insertButton}
              onClick={handleInsert}
              disabled={inserting}
            >
              {inserting ? "Inserting…" : "Insert into Email"}
            </Button>
            <Button appearance="secondary" onClick={onBack}>
              Back
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview;
