import * as React from "react";
import { Input, Text, makeStyles, tokens } from "@fluentui/react-components";
import { Search24Regular, ChevronRight20Regular } from "@fluentui/react-icons";
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
    flexWrap: "wrap",
    gap: "6px",
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
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
    flexShrink: 0,
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
    border: "1px solid #1a1a2e",
    ":hover": {
      backgroundColor: "#16213e",
    },
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  // --- All view: category cards ---
  categoryCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    cursor: "pointer",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  categoryCardLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  categoryCardName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  categoryCardCount: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  categoryCardChevron: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  // --- Category view: template name rows ---
  templateRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
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
  },
  templateChevron: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  // --- Search results (show name + category label) ---
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
  empty: {
    padding: "32px 16px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
  },
});

const TemplateList: React.FC<TemplateListProps> = ({ templates, onSelect }) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category)));
    return ["All", ...cats];
  }, [templates]);

  const isSearching = searchQuery.trim().length > 0;

  // Templates filtered by search (used when searching)
  const searchFiltered = React.useMemo(() => {
    if (!isSearching) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
    );
  }, [templates, searchQuery, isSearching]);

  // Grouped for search results view
  const searchGrouped = React.useMemo(() => {
    const groups: Record<string, Template[]> = {};
    searchFiltered.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [searchFiltered]);

  // Templates in the active category
  const categoryTemplates = React.useMemo(() => {
    if (activeCategory === "All") return [];
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  // Category counts for the All view
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
  };

  const renderContent = () => {
    // Search results override everything
    if (isSearching) {
      if (Object.keys(searchGrouped).length === 0) {
        return <div className={styles.empty}>No templates found</div>;
      }
      return Object.entries(searchGrouped).map(([category, items]) => (
        <div key={category} className={styles.categorySection}>
          <div className={styles.categoryHeader}>{category}</div>
          {items.map((template) => (
            <div key={template.id} className={styles.templateRow} onClick={() => onSelect(template)}>
              <Text className={styles.templateName}>{template.name}</Text>
              <ChevronRight20Regular className={styles.templateChevron} />
            </div>
          ))}
        </div>
      ));
    }

    // All view: category summary cards
    if (activeCategory === "All") {
      const cats = categories.filter((c) => c !== "All");
      if (cats.length === 0) return <div className={styles.empty}>No templates found</div>;
      return cats.map((cat) => (
        <div key={cat} className={styles.categoryCard} onClick={() => handleCategoryClick(cat)}>
          <div className={styles.categoryCardLeft}>
            <Text className={styles.categoryCardName}>{cat}</Text>
            <Text className={styles.categoryCardCount}>
              {categoryCounts[cat] ?? 0} template{(categoryCounts[cat] ?? 0) !== 1 ? "s" : ""}
            </Text>
          </div>
          <ChevronRight20Regular className={styles.categoryCardChevron} />
        </div>
      ));
    }

    // Category view: names only
    if (categoryTemplates.length === 0) {
      return <div className={styles.empty}>No templates found</div>;
    }
    return categoryTemplates.map((template) => (
      <div key={template.id} className={styles.templateRow} onClick={() => onSelect(template)}>
        <Text className={styles.templateName}>{template.name}</Text>
        <ChevronRight20Regular className={styles.templateChevron} />
      </div>
    ));
  };

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
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className={styles.list}>{renderContent()}</div>
    </div>
  );
};

export default TemplateList;
