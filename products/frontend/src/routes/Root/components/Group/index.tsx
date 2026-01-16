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
      <ul className={styles.ul}>
        {props.groups.map((group) => (
          <li className={styles.li} key={group.group_id}>
            <Link className={styles.link} to={`/group/${group.group_id}`}>
              {/* section 1 */}
              <div className={styles.groupNameWrapper}>
                <h3 className={styles.groupName}>{group.group_name}</h3>
                <SquareArrowOutUpRight className={styles.icon} />
              </div>
              {/* section 2 */}
              <div className={styles.createdByWrapper}>
                <small className={styles.label}>created by&thinsp;:&nbsp;</small>
                <small className={styles.createdBy}>{group.created_by_name}</small>
              </div>
              {/* section 3 */}
              <div className={styles.memberWrapper}>
                <small className={styles.label}>[メンバー]</small>
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
