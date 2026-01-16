import { type FC } from 'react';
// react-router
import { Link } from 'react-router';
// icons
import { SquareArrowOutUpRight } from 'lucide-react';
// components
import { SubTitle } from '../../../../share';
// css
import styles from './index.module.css';

type Props = {
  groups: {
    group_id: string;
    group_name: string;
    created_by_id: string;
    created_by_name: string;
    members: {
      user_id: string;
      user_name: string;
    }[];
  }[];
};

const Group: FC<Props> = (props: Props) => {
  return (
    <>
      <SubTitle subTitle="所属グループ" />
      <ul className={styles.groupUl}>
        {props.groups.map((group) => (
          <li className={styles.groupLi} key={group.group_id}>
            <Link className={styles.groupLink} to={`/group/${group.group_id}`}>
              <h3 className={styles.groupName}>{group.group_name}</h3>
              <SquareArrowOutUpRight />
              <div className={styles.groupHeader}>
                <div className={styles.createdByWrapper}>
                  <small className={styles.createdByLabel}>created by&thinsp;:&nbsp;</small>
                  <small className={styles.createdBy}>{group.created_by_name}</small>
                </div>
              </div>
              <div className={styles.memberBox}>
                <small className={styles.memberLabel}>[メンバー]</small>
                <p className={styles.memberNames}>
                  {group.members.map((member, index) =>
                    index === group.members.length - 1 ? `${member.user_name}` : `${member.user_name}、`
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Group;
