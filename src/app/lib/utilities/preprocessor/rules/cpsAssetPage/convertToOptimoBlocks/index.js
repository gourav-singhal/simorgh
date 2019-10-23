import { clone, pathOr, path } from 'ramda';
import paragraph from './blocks/paragraph';

const handleMissingType = block =>
  console.log(`Missing type field on block ${block.type}`); // eslint-disable-line no-console

const typesToConvert = {
  paragraph,
};

const parseBlockByType = block => {
  if (!path(['type'], block)) return false;

  const { type } = block;

  // if the block has text handle escaped quotes
  if (path(['text'], block)) {
    block.text = block.text.replace(/&quot;/g, '"'); // eslint-disable-line no-param-reassign
  }

  const parsedBlock = (typesToConvert[type] || handleMissingType)(block);

  if (!parsedBlock) {
    return null;
  }

  return parsedBlock;
};

const convertToOptimoBlocks = async jsonRaw => {
  const json = clone(jsonRaw);
  const blocks = pathOr([], ['content', 'blocks'], json);

  const parsedBlocks = await Promise.all(blocks.map(parseBlockByType));

  return {
    ...json,
    content: {
      model: {
        blocks: parsedBlocks.filter(Boolean),
      },
    },
  };
};

export default convertToOptimoBlocks;
