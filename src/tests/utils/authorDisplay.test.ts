import { describe, expect, it } from 'vitest';
import {
  formatAuthorLabel,
  toDraftIdentity,
} from '../../utils/authorDisplay';

describe('formatAuthorLabel', () => {
  it('匿名フラグが true なら匿名と表示する', () => {
    expect(formatAuthorLabel({ isAnonymous: true, authorName: '田中' })).toBe(
      '匿名',
    );
  });

  it('記名かつ名前ありなら名前を表示する', () => {
    expect(
      formatAuthorLabel({ isAnonymous: false, authorName: '佐藤' }),
    ).toBe('佐藤');
  });

  it('記名でも名前が空なら匿名と表示する', () => {
    expect(formatAuthorLabel({ isAnonymous: false })).toBe('匿名');
    expect(formatAuthorLabel({ isAnonymous: false, authorName: '  ' })).toBe(
      '匿名',
    );
  });
});

describe('toDraftIdentity', () => {
  it('未入力と空白のみは匿名にする', () => {
    expect(toDraftIdentity('')).toEqual({
      isAnonymous: true,
      authorName: '',
    });
    expect(toDraftIdentity('   ')).toEqual({
      isAnonymous: true,
      authorName: '',
    });
  });

  it('名前は trim して記名にする', () => {
    expect(toDraftIdentity(' 山田太郎 ')).toEqual({
      isAnonymous: false,
      authorName: '山田太郎',
    });
  });
});
