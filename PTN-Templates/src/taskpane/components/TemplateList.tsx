import * as React from "react";
import { Input, Text, makeStyles, tokens } from "@fluentui/react-components";
import { Search24Regular, ChevronRight20Regular, ChevronLeft20Regular } from "@fluentui/react-icons";
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
  // Back header shown when inside a category
  backHeader: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: "pointer",
    flexShrink: 0,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  backIcon: {
    color: tokens.colorNeutralForeground3,
  },
  backLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginRight: "4px",
  },
  categoryTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  // All view: category cards
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
  // Category view: template name rows
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
  // Search results
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
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const categories = React.useMemo(() => Array.from(new Set(templates.map((t) => t.category))), [templates]);

  const isSearching = searchQuery.trim().length > 0;

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

  const searchGrouped = React.useMemo(() => {
    const groups: Record<string, Template[]> = {};
    searchFiltered.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [searchFiltered]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const categoryTemplates = React.useMemo(() => {
    if (!activeCategory) return [];
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  const renderContent = () => {
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

    if (!activeCategory) {
      if (categories.length === 0) return <div className={styles.empty}>No templates found</div>;
      return categories.map((cat) => (
        <div key={cat} className={styles.categoryCard} onClick={() => setActiveCategory(cat)}>
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

      {activeCategory && !isSearching && (
        <div className={styles.backHeader} onClick={() => setActiveCategory(null)}>
          <ChevronLeft20Regular className={styles.backIcon} />
          <Text className={styles.backLabel}>All</Text>
          <Text className={styles.categoryTitle}>{activeCategory}</Text>
        </div>
      )}

      <div className={styles.list}>{renderContent()}</div>
    </div>
  );
};

export default TemplateList;
