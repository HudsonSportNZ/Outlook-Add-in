import * as React from "react";
import { Input, Text, makeStyles, tokens } from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";
import { Template } from "../types/template";

interface TemplateListProps {
  templates: Template[];
  onSelect: (template: Template) => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  searchBar: {
    padding: "10px 12px 8px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  searchInput: {
    width: "100%",
  },
  categoryRow: {
    display: "flex",
    flexDirection: "row",
    gap: "6px",
    padding: "8px 12px",
    overflowX: "auto",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    scrollbarWidth: "none",
    "::-webkit-scrollbar": { display: "none" },
    flexShrink: 0,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
    cursor: "pointer",
    whiteSpace: "nowrap",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    transition: "background-color 0.15s, color 0.15s",
    userSelect: "none",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  pillActive: {
    backgroundColor: "#1a1a2e",
    color: tokens.colorNeutralForegroundOnBrand,
    borderColor: "#1a1a2e",
    ":hover": {
      backgroundColor: "#16213e",
    },
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  categorySection: {
    marginBottom: "4px",
  },
  categoryHeader: {
    padding: "6px 14px 2px",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  templateRow: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 14px",
    cursor: "pointer",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  templateName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    marginBottom: "2px",
  },
  templatePreview: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  empty: {
    padding: "32px 16px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
  },
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, onSelect }) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category)));
    return ["All", ...cats];
  }, [templates]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    return templates.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [templates, searchQuery, activeCategory]);

  const grouped = React.useMemo(() => {
    const groups: Record<string, Template[]> = {};
    filtered.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filtered]);

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(_e, data) => setSearchQuery(data.value)}
          contentBefore={<Search24Regular />}
          size="medium"
        />
      </div>

      <div className={styles.categoryRow}>
        {categories.map((cat) => (
          <span
            key={cat}
            className={`${styles.pill} ${cat === activeCategory ? styles.pillActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className={styles.list}>
        {Object.keys(grouped).length === 0 ? (
          <div className={styles.empty}>No templates found</div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>{category}</div>
              {items.map((template) => (
                <div key={template.id} className={styles.templateRow} onClick={() => onSelect(template)}>
                  <Text className={styles.templateName}>{template.name}</Text>
                  <Text className={styles.templatePreview}>{stripHtml(template.body)}</Text>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TemplateList;
