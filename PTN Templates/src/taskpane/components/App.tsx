import * as React from "react";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { Template } from "../types/template";
import { fetchTemplates } from "../services/templateService";
import TemplateList from "./TemplateList";
import TemplatePreview from "./TemplatePreview";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorState from "./ErrorState";

type View = "list" | "preview";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    backgroundColor: "#1a1a2e",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#ffffff",
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase400,
    letterSpacing: "0.02em",
  },
  headerCount: {
    color: "rgba(255,255,255,0.6)",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
  },
  content: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
});

const App: React.FC = () => {
  const styles = useStyles();
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>("list");
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);

  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template);
    setView("preview");
  };

  const handleBack = () => {
    setView("list");
    setSelectedTemplate(null);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text className={styles.headerTitle}>PTN Templates</Text>
        {!loading && !error && (
          <Text className={styles.headerCount}>{templates.length} templates</Text>
        )}
      </header>

      <div className={styles.content}>
        {loading && <LoadingSkeleton />}
        {!loading && error && <ErrorState message={error} onRetry={loadTemplates} />}
        {!loading && !error && view === "list" && (
          <TemplateList templates={templates} onSelect={handleSelect} />
        )}
        {!loading && !error && view === "preview" && selectedTemplate && (
          <TemplatePreview template={selectedTemplate} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default App;
