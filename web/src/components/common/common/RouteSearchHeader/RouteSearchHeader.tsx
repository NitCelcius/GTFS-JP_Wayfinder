import styles from "./RouteSearchHeader.module.css";

interface RouteSearchHeaderProps {
  icon: React.ReactNode;
  title: string;
}

export function RouteSearchHeader({ icon, title }: RouteSearchHeaderProps) {
  return (
    <div className={styles.container} data-name="HeaderLevel1">
      <div className={styles.content}>
        <div className={styles.inner}>
          {icon}
          <div className={styles.title}>
            <p className={styles.titleText}>{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
