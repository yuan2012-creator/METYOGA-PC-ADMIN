import React from 'react';
import type { OptimizationTipItem } from './courseOperationViewModel';

interface CourseOptimizationPanelProps {
  tips: OptimizationTipItem[];
  selectedTipId: string | null;
  onSelectTip: (tipId: string) => void;
  onTipAction: (tipId: string, action: string) => void;
}

const CourseOptimizationPanel: React.FC<CourseOptimizationPanelProps> = ({
  tips,
  selectedTipId,
  onSelectTip,
  onTipAction,
}) => (
  <section className="met-course-optimization met-course-optimization--compact">
    <h2 className="met-course-optimization__title">排课优化建议</h2>
    <div className="met-course-optimization__scroll custom-scroll">
      {tips.map(tip => {
        const selected = selectedTipId === tip.id;
        return (
          <article
            key={tip.id}
            className={`met-course-optimization-card ${selected ? 'is-selected' : ''}`}
          >
            <button
              type="button"
              className="met-course-optimization-card__main"
              onClick={() => onSelectTip(tip.id)}
            >
              <span className="met-course-optimization-card__tag">{tip.category}</span>
              <p className="met-course-optimization-card__line">{tip.summary}</p>
            </button>
            <button
              type="button"
              className="met-course-optimization-card__action"
              onClick={() => onTipAction(tip.id, tip.action)}
            >
              处理
            </button>
          </article>
        );
      })}
    </div>
  </section>
);

export default CourseOptimizationPanel;
