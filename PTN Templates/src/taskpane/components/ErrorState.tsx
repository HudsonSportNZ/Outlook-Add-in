import * as React from "react";
import { Button, Text, makeStyles, tokens } from "@fluentui/react-components";
import { ErrorCircle24Regular } from "@fluentui/react-icons";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    gap: "12px",
    textAlign: "center",
  },
  icon: {
    color: tokens.colorPaletteRedForeground1,
  },
  message: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
  },
});

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <ErrorCircle24Regular className={styles.icon} />
      <Text className={styles.message}>{message}</Text>
      <Button appearance="primary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
};

export default ErrorState;
