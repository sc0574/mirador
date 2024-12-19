import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';
import WindowSideBar from '../containers/WindowSideBar';
import CompanionArea from '../containers/CompanionArea';
import CollectionDialog from '../containers/CollectionDialog';
import ns from '../config/css-ns';

const AudioViewer = lazy(() => import('../containers/AudioViewer'));
const GalleryView = lazy(() => import('../containers/GalleryView'));
const SelectCollection = lazy(() => import('../containers/SelectCollection'));
const WindowViewer = lazy(() => import('../containers/WindowViewer'));
const VideoViewer = lazy(() => import('../containers/VideoViewer'));

GalleryView.displayName = 'GalleryView';
SelectCollection.displayName = 'SelectCollection';
WindowViewer.displayName = 'WindowViewer';

const Root = styled('div', { name: 'PrimaryWindow', slot: 'root' })(() => ({
  display: 'flex',
  flex: 1,
  position: 'relative',
}));

/**  */
const TypeSpecificViewer = ({
  audioResources = [], isCollection = false,
  isFetching = false, videoResources = [], view = undefined,
}) => {
  if (isCollection) {
    return (
      <SelectCollection />
    );
  }
  if (isFetching === false) {
    if (view === 'gallery') {
      return (
        <GalleryView />
      );
    }
    if (videoResources.length > 0) {
      return (
        <VideoViewer />
      );
    }
    if (audioResources.length > 0) {
      return (
        <AudioViewer />
      );
    }
    return (
      <WindowViewer />
    );
  }
  return null;
};

TypeSpecificViewer.propTypes = {
  audioResources: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
  isCollection: PropTypes.bool,
  isFetching: PropTypes.bool,
  videoResources: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
  view: PropTypes.string,
};

/**
 * PrimaryWindow - component that renders the primary content of a Mirador
 * window. Right now this differentiates between a Image, Video, or Audio viewer.
 */
export function PrimaryWindow({
  audioResources = undefined, isCollection = false, isFetching = false, videoResources = undefined,
  view = undefined, isCollectionDialogVisible = false, children = null, className = undefined,
}) {
  const viewerProps = {
    audioResources,
    isCollection,
    isFetching,
    videoResources,
    view,
  };

  return (
    <Root data-testid="test-window" className={classNames(ns('primary-window'), className)}>
      <WindowSideBar />
      <CompanionArea position="left" />
      { isCollectionDialogVisible && <CollectionDialog /> }
      <Suspense fallback={<div />}>
        {children || <TypeSpecificViewer {...viewerProps} />}
      </Suspense>
    </Root>
  );
}

PrimaryWindow.propTypes = {
  audioResources: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
  children: PropTypes.node,
  className: PropTypes.string,
  isCollection: PropTypes.bool,
  isCollectionDialogVisible: PropTypes.bool,
  isFetching: PropTypes.bool,
  videoResources: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
  view: PropTypes.string,
};
