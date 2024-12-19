import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import CollapsibleSection from '../containers/CollapsibleSection';
import SanitizedHtml from '../containers/SanitizedHtml';
import { LabelValueMetadata } from './LabelValueMetadata';
import { PluginHook } from './PluginHook';

/**
 * CanvasInfo
 */
export function CanvasInfo({
  canvasDescription = null,
  canvasLabel = null,
  canvasMetadata = [],
  id,
  index = 1,
  totalSize = 1,
}) {
  const { t } = useTranslation();
  const pluginProps = arguments[0]; // eslint-disable-line prefer-rest-params

  return (
    <CollapsibleSection
      id={`${id}-currentItem-${index}`}
      label={t('currentItem', { context: `${index + 1}/${totalSize}` })}
    >
      {canvasLabel && (
        <Typography
          aria-labelledby={
            `${id}-currentItem-${index} ${id}-currentItem-${index}-heading`
          }
          id={`${id}-currentItem-${index}-heading`}
          variant="h4"
          component="h5"
        >
          {canvasLabel}
        </Typography>
      )}

      {canvasDescription && (
        <Typography variant="body1">
          <SanitizedHtml htmlString={canvasDescription} ruleSet="iiif" />
        </Typography>
      )}

      {canvasMetadata && canvasMetadata.length > 0 && (
        <LabelValueMetadata labelValuePairs={canvasMetadata} />
      )}
      <PluginHook {...pluginProps} />
    </CollapsibleSection>
  );
}

CanvasInfo.propTypes = {
  canvasDescription: PropTypes.string,
  canvasLabel: PropTypes.string,
  canvasMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  id: PropTypes.string.isRequired,
  index: PropTypes.number,
  totalSize: PropTypes.number,
};
