import * as React from "react";
import { makeStyles, Skeleton, SkeletonItem, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryHeader: {
    height: "16px",
    width: "80px",
    marginBottom: "4px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "10px 12px",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    marginBottom: "4px",
  },
  titleLine: {
    height: "14px",
    width: "70%",
  },
  previewLine: {
    height: "12px",
    width: "90%",
  },
});

const SkeletonCard: React.FC = () => {
  const styles = useStyles();
  return (
    <Skeleton>
      <div className={styles.card}>
        <SkeletonItem className={styles.titleLine} />
        <SkeletonItem className={styles.previewLine} />
      </div>
    </Skeleton>
  );
};

const LoadingSkeleton: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Skeleton>
        <SkeletonItem className={styles.categoryHeader} />
      </Skeleton>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <Skeleton>
        <SkeletonItem className={styles.categoryHeader} />
      </Skeleton>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
};

export default LoadingSkeleton;
