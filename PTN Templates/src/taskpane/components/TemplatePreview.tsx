/* global Office */

import * as React from "react";
import { Button, Badge, Text, makeStyles, tokens } from "@fluentui/react-components";
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
    gap: "6px",
  },
  mergeLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  mergeFields: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
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
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim()))];
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onBack }) => {
  const styles = useStyles();
  const [inserted, setInserted] = React.useState(false);
  const [inserting, setInserting] = React.useState(false);
  const [insertError, setInsertError] = React.useState<string | null>(null);

  const mergeFields = React.useMemo(() => detectMergeFields(template.body), [template.body]);

  const handleInsert = async () => {
    setInserting(true);
    setInsertError(null);
    try {
      const item = Office.context.mailbox.item;
      if (!item) throw new Error("No active compose item");

      await new Promise<void>((resolve, reject) => {
        item.subject.setAsync(template.subject, (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error.message));
          } else {
            resolve();
          }
        });
      });

      await new Promise<void>((resolve, reject) => {
        item.body.setAsync(template.body, { coercionType: Office.CoercionType.Html }, (result) => {
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
          <div
            className={styles.bodyCard}
            dangerouslySetInnerHTML={{ __html: template.body }}
          />
        </div>

        {mergeFields.length > 0 && (
          <div className={styles.mergeFieldsSection}>
            <Text className={styles.mergeLabel}>Merge Fields</Text>
            <div className={styles.mergeFields}>
              {mergeFields.map((field) => (
                <Badge key={field} appearance="outline" size="small">
                  {`{{${field}}}`}
                </Badge>
              ))}
            </div>
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
